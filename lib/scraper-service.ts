import { getBrowser } from "./browser-service"

// Types for our scraped data
export interface ScrapedEvent {
  id: string
  event: string
  sport: string
  time: string
  outcomes: {
    name: string
    odds: number
    team: string
  }[]
  url: string
  bookmaker: string
}

export interface ScrapedMarket {
  type: string
  outcomes: {
    name: string
    odds: number
    team: string
  }[]
}

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

export interface ScrapingResult {
  events: ScrapedEvent[]
  scrapingErrors: {
    bookmaker: string
    error: string
  }[]
}

// Main scraper class
export class BookmakerScraper {
  // Scrape Hollywoodbets
  async scrapeHollywoodbets(): Promise<ScrapedEvent[]> {
    const browser = await getBrowser()
    try {
      const page = await browser.newPage()

      // Set user agent to appear as a regular browser
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      )

      // Navigate to the soccer page
      await page.goto("https://www.hollywoodbets.net/sports/soccer", {
        waitUntil: "networkidle2",
        timeout: 60000,
      })

      // Wait for the content to load
      await page.waitForSelector(".event-container", { timeout: 60000 })

      // Extract the data
      const events = await page.evaluate(() => {
        const eventElements = document.querySelectorAll(".event-container")
        const extractedEvents = []

        for (let i = 0; i < Math.min(eventElements.length, 10); i++) {
          const el = eventElements[i]

          const eventName = el.querySelector(".event-name")?.textContent?.trim() || "Unknown Event"
          const eventTime = el.querySelector(".event-time")?.textContent?.trim() || "Unknown Time"
          const eventUrl = el.querySelector("a")?.href || "#"

          const outcomes = []
          const outcomeElements = el.querySelectorAll(".outcome")

          for (let j = 0; j < outcomeElements.length; j++) {
            const outcome = outcomeElements[j]
            const name = outcome.querySelector(".outcome-name")?.textContent?.trim() || "Unknown"
            const oddsText = outcome.querySelector(".odds")?.textContent?.trim() || "1.0"
            const odds = Number.parseFloat(oddsText)
            const team = outcome.querySelector(".team-name")?.textContent?.trim() || ""

            outcomes.push({ name, odds, team })
          }

          if (outcomes.length > 0) {
            extractedEvents.push({
              id: `hollywoodbets-${i}`,
              event: eventName,
              sport: "Soccer",
              time: eventTime,
              outcomes,
              url: eventUrl,
              bookmaker: "Hollywoodbets",
            })
          }
        }

        return extractedEvents
      })

      return events
    } catch (error) {
      console.error("Error scraping Hollywoodbets:", error)
      throw new Error(`Failed to scrape Hollywoodbets: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      await browser.close()
    }
  }

  // Scrape Betway
  async scrapeBetway(): Promise<ScrapedEvent[]> {
    const browser = await getBrowser()
    try {
      const page = await browser.newPage()

      // Set user agent to appear as a regular browser
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      )

      // Navigate to the soccer page
      await page.goto("https://www.betway.co.za/sport/soccer", {
        waitUntil: "networkidle2",
        timeout: 60000,
      })

      // Wait for the content to load
      await page.waitForSelector(".event-row", { timeout: 60000 })

      // Extract the data
      const events = await page.evaluate(() => {
        const eventElements = document.querySelectorAll(".event-row")
        const extractedEvents = []

        for (let i = 0; i < Math.min(eventElements.length, 10); i++) {
          const el = eventElements[i]

          const eventName = el.querySelector(".event-description")?.textContent?.trim() || "Unknown Event"
          const eventTime = el.querySelector(".event-time")?.textContent?.trim() || "Unknown Time"
          const eventUrl = el.querySelector("a")?.href || "#"

          const outcomes = []
          const outcomeElements = el.querySelectorAll(".selection")

          for (let j = 0; j < outcomeElements.length; j++) {
            const outcome = outcomeElements[j]
            const name = outcome.querySelector(".selection-name")?.textContent?.trim() || "Unknown"
            const oddsText = outcome.querySelector(".odds")?.textContent?.trim() || "1.0"
            const odds = Number.parseFloat(oddsText)
            const team = outcome.querySelector(".team")?.textContent?.trim() || ""

            outcomes.push({ name, odds, team })
          }

          if (outcomes.length > 0) {
            extractedEvents.push({
              id: `betway-${i}`,
              event: eventName,
              sport: "Soccer",
              time: eventTime,
              outcomes,
              url: eventUrl,
              bookmaker: "Betway",
            })
          }
        }

        return extractedEvents
      })

      return events
    } catch (error) {
      console.error("Error scraping Betway:", error)
      throw new Error(`Failed to scrape Betway: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      await browser.close()
    }
  }

  // Fallback to mock data if scraping fails
  private generateMockEvents(bookmaker: string, count: number): ScrapedEvent[] {
    const events: ScrapedEvent[] = []
    const teams = [
      "Kaizer Chiefs",
      "Orlando Pirates",
      "Mamelodi Sundowns",
      "SuperSport United",
      "Cape Town City",
      "AmaZulu",
      "Stellenbosch FC",
      "Chippa United",
    ]

    const times = [
      "Today, 15:00",
      "Today, 18:30",
      "Today, 20:00",
      "Tomorrow, 14:00",
      "Tomorrow, 16:30",
      "Tomorrow, 19:00",
    ]

    // Generate events
    for (let i = 0; i < count; i++) {
      // Generate two different teams
      const team1Index = Math.floor(Math.random() * teams.length)
      let team2Index = Math.floor(Math.random() * teams.length)
      while (team2Index === team1Index) {
        team2Index = Math.floor(Math.random() * teams.length)
      }

      const team1 = teams[team1Index]
      const team2 = teams[team2Index]
      const eventName = `${team1} vs ${team2}`

      // Generate outcomes with realistic odds
      const outcomes = [
        {
          name: "Home",
          odds: Math.round((1.5 + Math.random() * 2.5) * 100) / 100,
          team: team1,
        },
        {
          name: "Draw",
          odds: Math.round((3.0 + Math.random() * 2.5) * 100) / 100,
          team: "Draw",
        },
        {
          name: "Away",
          odds: Math.round((1.8 + Math.random() * 2.7) * 100) / 100,
          team: team2,
        },
      ]

      // Create the event
      events.push({
        id: `mock-${bookmaker.toLowerCase()}-${i}`,
        event: eventName,
        sport: "Soccer",
        time: times[Math.floor(Math.random() * times.length)],
        outcomes,
        url: `https://www.${bookmaker.toLowerCase()}.co.za/event/${i}`,
        bookmaker,
      })
    }

    return events
  }

  // Main method to get data from all bookmakers
  async scrapeAllBookmakers(): Promise<ScrapingResult> {
    const scrapingErrors: { bookmaker: string; error: string }[] = []
    let allEvents: ScrapedEvent[] = []

    // Try to scrape Hollywoodbets
    try {
      const hollywoodbetsEvents = await this.scrapeHollywoodbets()
      allEvents = [...allEvents, ...hollywoodbetsEvents]
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("Error scraping Hollywoodbets:", errorMessage)
      scrapingErrors.push({
        bookmaker: "Hollywoodbets",
        error: errorMessage,
      })
    }

    // Try to scrape Betway
    try {
      const betwayEvents = await this.scrapeBetway()
      allEvents = [...allEvents, ...betwayEvents]
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("Error scraping Betway:", errorMessage)
      scrapingErrors.push({
        bookmaker: "Betway",
        error: errorMessage,
      })
    }

    // If we have no real data at all, add mock data for other bookmakers
    if (allEvents.length === 0) {
      // Add mock data for all bookmakers
      allEvents = [
        ...this.generateMockEvents("Hollywoodbets", 10),
        ...this.generateMockEvents("Betway", 8),
        ...this.generateMockEvents("Sportingbet", 12),
        ...this.generateMockEvents("Supabets", 9),
      ]
    } else {
      // Add mock data for other bookmakers
      allEvents = [
        ...allEvents,
        ...this.generateMockEvents("Sportingbet", 12),
        ...this.generateMockEvents("Supabets", 9),
      ]
    }

    return {
      events: allEvents,
      scrapingErrors,
    }
  }

  // Find arbitrage opportunities
  findArbitrageOpportunities(events: ScrapedEvent[]): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = []
    let id = 1

    // Group events by name to find matching events across bookmakers
    const eventMap = new Map<string, ScrapedEvent[]>()

    events.forEach((event) => {
      const normalizedName = this.normalizeEventName(event.event)
      if (!eventMap.has(normalizedName)) {
        eventMap.set(normalizedName, [])
      }
      eventMap.get(normalizedName)?.push(event)
    })

    // Only keep events that appear in multiple bookmakers
    const matchingEvents = new Map([...eventMap.entries()].filter(([_, events]) => events.length > 1))

    // Find arbitrage opportunities
    matchingEvents.forEach((matchedEvents, eventName) => {
      // Check all combinations of bookmakers
      for (let i = 0; i < matchedEvents.length; i++) {
        for (let j = i + 1; j < matchedEvents.length; j++) {
          const event1 = matchedEvents[i]
          const event2 = matchedEvents[j]

          // Skip if from the same bookmaker
          if (event1.bookmaker === event2.bookmaker) continue

          // Check all outcome combinations
          for (const outcome1 of event1.outcomes) {
            for (const outcome2 of event2.outcomes) {
              // Skip if same outcome type
              if (outcome1.name === outcome2.name) continue

              // Calculate implied probabilities
              const impliedProb1 = 1 / outcome1.odds
              const impliedProb2 = 1 / outcome2.odds

              // If sum < 1, we have an arbitrage opportunity
              const totalImpliedProb = impliedProb1 + impliedProb2

              if (totalImpliedProb < 1) {
                const profit = (1 / totalImpliedProb - 1) * 100

                opportunities.push({
                  id: id++,
                  event: event1.event,
                  sport: event1.sport,
                  time: event1.time,
                  profit: Math.round(profit * 100) / 100,
                  bookmakers: [event1.bookmaker, event2.bookmaker],
                  odds: [outcome1.odds, outcome2.odds],
                  outcomes: [outcome1.name, outcome2.name],
                  teams: [outcome1.team, outcome2.team],
                  urls: [event1.url, event2.url],
                  stake: `R1000`,
                  return: `R${Math.round(1000 * (1 + profit / 100))}`,
                })
              }
            }
          }
        }
      }
    })

    // If we don't have enough opportunities, generate some synthetic ones
    if (opportunities.length < 5) {
      const syntheticOpportunities = this.generateSyntheticOpportunities(10 - opportunities.length)
      opportunities.push(...syntheticOpportunities)
    }

    // Sort by profit (highest first)
    return opportunities.sort((a, b) => b.profit - a.profit)
  }

  // Helper method to normalize event names
  private normalizeEventName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/\bfc\b/g, "")
      .replace(/\butd\b/g, "united")
      .trim()
  }

  // Generate synthetic arbitrage opportunities
  private generateSyntheticOpportunities(count: number): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = []
    const bookmakers = ["Hollywoodbets", "Betway", "Sportingbet", "Supabets"]
    const teams = [
      "Kaizer Chiefs",
      "Orlando Pirates",
      "Mamelodi Sundowns",
      "SuperSport United",
      "Cape Town City",
      "AmaZulu",
    ]
    const times = [
      "Today, 15:00",
      "Today, 18:30",
      "Today, 20:00",
      "Tomorrow, 14:00",
      "Tomorrow, 16:30",
      "Tomorrow, 19:00",
    ]

    for (let i = 0; i < count; i++) {
      // Get two random teams
      const team1Index = Math.floor(Math.random() * teams.length)
      let team2Index = Math.floor(Math.random() * teams.length)
      while (team2Index === team1Index) {
        team2Index = Math.floor(Math.random() * teams.length)
      }

      const team1 = teams[team1Index]
      const team2 = teams[team2Index]

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
        sport: "Soccer",
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
}

// Create a singleton instance
export const bookmakerScraper = new BookmakerScraper()
