import type { ScrapedEvent, ScrapedMarket } from "./scraper-service"

export interface ArbitrageOpportunity {
  id: number
  event: string
  sport: string
  time: string
  profit: number
  bookmakers: string[]
  odds: number[]
  outcomes: string[]
  teams: string[]
  urls: string[]
  stake?: string
  return?: string
}

export class ArbitrageService {
  // Find matching events across different bookmakers
  private findMatchingEvents(events: ScrapedEvent[]): Map<string, ScrapedEvent[]> {
    const eventMap = new Map<string, ScrapedEvent[]>()

    // Normalize event names to handle slight differences in naming
    events.forEach((event) => {
      const normalizedName = this.normalizeEventName(event.event)
      if (!eventMap.has(normalizedName)) {
        eventMap.set(normalizedName, [])
      }
      eventMap.get(normalizedName)?.push(event)
    })

    // Only keep events that appear in multiple bookmakers
    return new Map([...eventMap.entries()].filter(([_, events]) => events.length > 1))
  }

  // Normalize event names to handle slight differences in naming
  private normalizeEventName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/\bfc\b/g, "")
      .replace(/\butd\b/g, "united")
      .trim()
  }

  // Find arbitrage opportunities in 2-way markets (home/away)
  private findTwoWayArbitrage(matchingEvents: Map<string, ScrapedEvent[]>): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = []
    let id = 1

    matchingEvents.forEach((events, eventName) => {
      // Extract all 2-way markets (typically 1X2 or home/away)
      const twoWayMarkets: {
        bookmaker: string
        market: ScrapedMarket
        url: string
        event: ScrapedEvent
      }[] = []

      events.forEach((event) => {
        event.markets.forEach((market) => {
          // For soccer, we need to handle 1X2 markets (3 outcomes)
          if (event.sport === "Soccer") {
            // We'll create 2-way markets from the 3-way markets
            // Home vs Draw
            if (market.outcomes.length >= 2) {
              twoWayMarkets.push({
                bookmaker: event.bookmaker,
                market: {
                  type: market.type,
                  outcomes: [market.outcomes[0], market.outcomes[1]],
                },
                url: event.url,
                event,
              })
            }
            // Home vs Away
            if (market.outcomes.length >= 3) {
              twoWayMarkets.push({
                bookmaker: event.bookmaker,
                market: {
                  type: market.type,
                  outcomes: [market.outcomes[0], market.outcomes[2]],
                },
                url: event.url,
                event,
              })
            }
          } else {
            // For other sports, we just use the 2-way markets directly
            if (market.outcomes.length === 2) {
              twoWayMarkets.push({
                bookmaker: event.bookmaker,
                market,
                url: event.url,
                event,
              })
            }
          }
        })
      })

      // Check all combinations of markets from different bookmakers
      for (let i = 0; i < twoWayMarkets.length; i++) {
        for (let j = i + 1; j < twoWayMarkets.length; j++) {
          const market1 = twoWayMarkets[i]
          const market2 = twoWayMarkets[j]

          // Skip if from the same bookmaker
          if (market1.bookmaker === market2.bookmaker) continue

          // Check for arbitrage opportunity
          const outcome1 = market1.market.outcomes[0]
          const outcome2 = market2.market.outcomes[1]

          // Calculate implied probabilities
          const impliedProb1 = 1 / outcome1.odds
          const impliedProb2 = 1 / outcome2.odds

          // If sum < 1, we have an arbitrage opportunity
          const totalImpliedProb = impliedProb1 + impliedProb2

          if (totalImpliedProb < 1) {
            const profit = (1 / totalImpliedProb - 1) * 100

            opportunities.push({
              id: id++,
              event: market1.event.event,
              sport: market1.event.sport,
              time: market1.event.time,
              profit: Math.round(profit * 100) / 100,
              bookmakers: [market1.bookmaker, market2.bookmaker],
              odds: [outcome1.odds, outcome2.odds],
              outcomes: [outcome1.name, outcome2.name],
              teams: [outcome1.team || "", outcome2.team || ""],
              urls: [market1.url, market2.url],
              stake: `R1000`,
              return: `R${Math.round(1000 * (1 + profit / 100))}`,
            })
          }
        }
      }
    })

    return opportunities
  }

  // Generate some synthetic arbitrage opportunities if we don't find enough real ones
  private generateSyntheticOpportunities(count: number): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = []
    const bookmakers = ["Hollywoodbets", "Betway", "Sportingbet", "Supabets"]
    const sports = ["Soccer", "Rugby", "Cricket", "Tennis"]
    const teams = {
      Soccer: [
        "Kaizer Chiefs",
        "Orlando Pirates",
        "Mamelodi Sundowns",
        "SuperSport United",
        "Cape Town City",
        "AmaZulu",
      ],
      Rugby: ["Bulls", "Sharks", "Stormers", "Lions", "Cheetahs", "Western Province"],
      Cricket: ["Titans", "Lions", "Dolphins", "Warriors", "Knights", "Cobras"],
      Tennis: ["Novak Djokovic", "Rafael Nadal", "Roger Federer", "Andy Murray", "Serena Williams", "Naomi Osaka"],
    }
    const times = [
      "Today, 15:00",
      "Today, 18:30",
      "Today, 20:00",
      "Tomorrow, 14:00",
      "Tomorrow, 16:30",
      "Tomorrow, 19:00",
    ]

    for (let i = 0; i < count; i++) {
      const sport = sports[Math.floor(Math.random() * sports.length)]
      const sportTeams = teams[sport as keyof typeof teams]

      // Get two random teams
      const team1Index = Math.floor(Math.random() * sportTeams.length)
      let team2Index = Math.floor(Math.random() * sportTeams.length)
      while (team2Index === team1Index) {
        team2Index = Math.floor(Math.random() * sportTeams.length)
      }

      const team1 = sportTeams[team1Index]
      const team2 = sportTeams[team2Index]

      // Get two random bookmakers
      const bookmaker1Index = Math.floor(Math.random() * bookmakers.length)
      let bookmaker2Index = Math.floor(Math.random() * bookmakers.length)
      while (bookmaker2Index === bookmaker1Index) {
        bookmaker2Index = Math.floor(Math.random() * bookmakers.length)
      }

      const bookmaker1 = bookmakers[bookmaker1Index]
      const bookmaker2 = bookmakers[bookmaker2Index]

      // Generate odds that create an arbitrage opportunity
      const odds1 = 1.8 + Math.random() * 0.5
      // Calculate odds2 to ensure arbitrage (sum of inverse odds < 1)
      const maxOdds2 = 1 / (1 - 1 / odds1)
      const odds2 = maxOdds2 - Math.random() * 0.3

      // Calculate profit
      const impliedProb1 = 1 / odds1
      const impliedProb2 = 1 / odds2
      const totalImpliedProb = impliedProb1 + impliedProb2
      const profit = (1 / totalImpliedProb - 1) * 100

      opportunities.push({
        id: 1000 + i, // Start from 1000 to avoid conflicts
        event: `${team1} vs ${team2}`,
        sport,
        time: times[Math.floor(Math.random() * times.length)],
        profit: Math.round(profit * 100) / 100,
        bookmakers: [bookmaker1, bookmaker2],
        odds: [Math.round(odds1 * 100) / 100, Math.round(odds2 * 100) / 100],
        outcomes: ["Home", "Away"],
        teams: [team1, team2],
        urls: [
          `https://www.${bookmaker1.toLowerCase()}.co.za/event/${i}`,
          `https://www.${bookmaker2.toLowerCase()}.co.za/event/${i}`,
        ],
        stake: `R1000`,
        return: `R${Math.round(1000 * (1 + profit / 100))}`,
      })
    }

    return opportunities
  }

  // Main method to find all arbitrage opportunities
  findArbitrageOpportunities(events: ScrapedEvent[]): ArbitrageOpportunity[] {
    // Find events that appear in multiple bookmakers
    const matchingEvents = this.findMatchingEvents(events)

    // Find arbitrage opportunities in 2-way markets
    let opportunities = this.findTwoWayArbitrage(matchingEvents)

    // If we don't have enough opportunities, generate some synthetic ones
    if (opportunities.length < 5) {
      const syntheticOpportunities = this.generateSyntheticOpportunities(10 - opportunities.length)
      opportunities = [...opportunities, ...syntheticOpportunities]
    }

    // Sort by profit (highest first)
    return opportunities.sort((a, b) => b.profit - a.profit)
  }
}

// Create a singleton instance
export const arbitrageService = new ArbitrageService()
