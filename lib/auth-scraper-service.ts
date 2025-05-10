import { getBrowser } from "./browser-service"
import type { LinkedBookmaker } from "@/components/bookmaker-manager"
import type { ScrapedEvent, ScrapingResult } from "./scraper-service"

export class AuthenticatedScraper {
  // Get all linked bookmakers from localStorage
  private getLinkedBookmakers(): LinkedBookmaker[] {
    if (typeof window === "undefined") return []

    try {
      const savedBookmakers = localStorage.getItem("linkedBookmakers")
      if (savedBookmakers) {
        return JSON.parse(savedBookmakers)
      }
    } catch (e) {
      console.error("Error loading saved bookmakers:", e)
    }

    return []
  }

  // Get active linked bookmakers
  private getActiveBookmakers(): LinkedBookmaker[] {
    const bookmakers = this.getLinkedBookmakers()
    return bookmakers.filter((b) => b.active)
  }

  // Scrape Betway with authentication
  async scrapeBetway(bookmaker: LinkedBookmaker): Promise<ScrapedEvent[]> {
    const browser = await getBrowser()
    try {
      const page = await browser.newPage()

      // Set user agent to appear as a regular browser
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      )

      // Navigate to the login page
      await page.goto("https://www.betway.co.za/login", {
        waitUntil: "networkidle2",
        timeout: 60000,
      })

      // Check if already logged in
      const isLoggedIn = await page.evaluate(() => {
        return window.location.href.includes("IsLoggedIn=true") || document.querySelector(".account-balance") !== null
      })

      if (!isLoggedIn) {
        // Fill in login form
        await page.waitForSelector("input[name='username']", { timeout: 30000 })
        await page.type("input[name='username']", bookmaker.username)
        await page.type("input[name='password']", bookmaker.password)

        // Click login button
        await page.click("button[type='submit']")

        // Wait for login to complete
        await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 })
      }

      // Update balance in localStorage if we're in the browser
      if (typeof window !== "undefined") {
        try {
          // Extract balance
          const balance = await page.evaluate(() => {
            const balanceElement =
              document.querySelector(".balance-amount") ||
              document.querySelector(".account-balance") ||
              document.querySelector(".user-balance")
            return balanceElement ? balanceElement.textContent.trim() : null
          })

          if (balance) {
            const savedBookmakers = localStorage.getItem("linkedBookmakers")
            if (savedBookmakers) {
              const bookmakers = JSON.parse(savedBookmakers)
              const updatedBookmakers = bookmakers.map((b: LinkedBookmaker) =>
                b.id === bookmaker.id ? { ...b, balance, lastUpdated: new Date().toISOString(), isLoggedIn: true } : b,
              )
              localStorage.setItem("linkedBookmakers", JSON.stringify(updatedBookmakers))
            }
          }
        } catch (e) {
          console.error("Error updating balance:", e)
        }
      }

      // Navigate to the soccer page
      await page.goto("https://www.betway.co.za/sport/soccer", {
        waitUntil: "networkidle2",
        timeout: 60000,
      })

      // Wait for the content to load
      await page.waitForSelector(".event-container", { timeout: 60000 })

      // Extract the data
      const events = await page.evaluate(() => {
        const eventElements = document.querySelectorAll(".event-container")
        const extractedEvents = []

        for (let i = 0; i < Math.min(eventElements.length, 20); i++) {
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
      console.error("Error scraping Betway with authentication:", error)
      throw new Error(`Failed to scrape Betway: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      await browser.close()
    }
  }

  // Scrape Hollywoodbets with authentication
  async scrapeHollywoodbets(bookmaker: LinkedBookmaker): Promise<ScrapedEvent[]> {
    const browser = await getBrowser()
    try {
      const page = await browser.newPage()

      // Set user agent to appear as a regular browser
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      )

      // Navigate to the login page
      await page.goto("https://www.hollywoodbets.net/login", {
        waitUntil: "networkidle2",
        timeout: 60000,
      })

      // Fill in login form
      await page.waitForSelector("#username", { timeout: 30000 })
      await page.type("#username", bookmaker.username)
      await page.type("#password", bookmaker.password)

      // Click login button
      await page.click("button[type='submit']")

      // Wait for login to complete
      await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 })

      // Update balance in localStorage if we're in the browser
      if (typeof window !== "undefined") {
        try {
          // Extract balance
          const balance = await page.evaluate(() => {
            const balanceElement =
              document.querySelector(".account-balance") ||
              document.querySelector(".balance-amount") ||
              document.querySelector(".user-balance")
            return balanceElement ? balanceElement.textContent.trim() : null
          })

          if (balance) {
            const savedBookmakers = localStorage.getItem("linkedBookmakers")
            if (savedBookmakers) {
              const bookmakers = JSON.parse(savedBookmakers)
              const updatedBookmakers = bookmakers.map((b: LinkedBookmaker) =>
                b.id === bookmaker.id ? { ...b, balance, lastUpdated: new Date().toISOString(), isLoggedIn: true } : b,
              )
              localStorage.setItem("linkedBookmakers", JSON.stringify(updatedBookmakers))
            }
          }
        } catch (e) {
          console.error("Error updating balance:", e)
        }
      }

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
      console.error("Error scraping Hollywoodbets with authentication:", error)
      throw new Error(`Failed to scrape Hollywoodbets: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      await browser.close()
    }
  }

  // Scrape Sportingbet with authentication
  async scrapeSportingbet(bookmaker: LinkedBookmaker): Promise<ScrapedEvent[]> {
    const browser = await getBrowser()
    try {
      const page = await browser.newPage()

      // Set user agent to appear as a regular browser
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      )

      // Navigate to the login page
      await page.goto("https://www.sportingbet.co.za/login", {
        waitUntil: "networkidle2",
        timeout: 60000,
      })

      // Fill in login form
      await page.waitForSelector("input[name='username']", { timeout: 30000 })
      await page.type("input[name='username']", bookmaker.username)
      await page.type("input[name='password']", bookmaker.password)

      // Click login button
      await page.click("button[type='submit']")

      // Wait for login to complete
      await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 })

      // Update balance in localStorage if we're in the browser
      if (typeof window !== "undefined") {
        try {
          // Extract balance
          const balance = await page.evaluate(() => {
            const balanceElement =
              document.querySelector(".account-balance") ||
              document.querySelector(".balance-amount") ||
              document.querySelector(".user-balance")
            return balanceElement ? balanceElement.textContent.trim() : null
          })

          if (balance) {
            const savedBookmakers = localStorage.getItem("linkedBookmakers")
            if (savedBookmakers) {
              const bookmakers = JSON.parse(savedBookmakers)
              const updatedBookmakers = bookmakers.map((b: LinkedBookmaker) =>
                b.id === bookmaker.id ? { ...b, balance, lastUpdated: new Date().toISOString(), isLoggedIn: true } : b,
              )
              localStorage.setItem("linkedBookmakers", JSON.stringify(updatedBookmakers))
            }
          }
        } catch (e) {
          console.error("Error updating balance:", e)
        }
      }

      // Navigate to the soccer page
      await page.goto("https://www.sportingbet.co.za/sports/football", {
        waitUntil: "networkidle2",
        timeout: 60000,
      })

      // Wait for the content to load
      await page.waitForSelector(".event-list", { timeout: 60000 })

      // Extract the data
      const events = await page.evaluate(() => {
        const eventElements = document.querySelectorAll(".event-item")
        const extractedEvents = []

        for (let i = 0; i < Math.min(eventElements.length, 10); i++) {
          const el = eventElements[i]

          const eventName = el.querySelector(".event-name")?.textContent?.trim() || "Unknown Event"
          const eventTime = el.querySelector(".event-time")?.textContent?.trim() || "Unknown Time"
          const eventUrl = el.querySelector("a")?.href || "#"

          const outcomes = []
          const outcomeElements = el.querySelectorAll(".market-option")

          for (let j = 0; j < outcomeElements.length; j++) {
            const outcome = outcomeElements[j]
            const name = outcome.querySelector(".option-name")?.textContent?.trim() || "Unknown"
            const oddsText = outcome.querySelector(".odds")?.textContent?.trim() || "1.0"
            const odds = Number.parseFloat(oddsText)
            const team = outcome.querySelector(".team-name")?.textContent?.trim() || ""

            outcomes.push({ name, odds, team })
          }

          if (outcomes.length > 0) {
            extractedEvents.push({
              id: `sportingbet-${i}`,
              event: eventName,
              sport: "Soccer",
              time: eventTime,
              outcomes,
              url: eventUrl,
              bookmaker: "Sportingbet",
            })
          }
        }

        return extractedEvents
      })

      return events
    } catch (error) {
      console.error("Error scraping Sportingbet with authentication:", error)
      throw new Error(`Failed to scrape Sportingbet: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      await browser.close()
    }
  }

  // Scrape Supabets with authentication
  async scrapeSupabets(bookmaker: LinkedBookmaker): Promise<ScrapedEvent[]> {
    const browser = await getBrowser()
    try {
      const page = await browser.newPage()

      // Set user agent to appear as a regular browser
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      )

      // Navigate to the login page
      await page.goto("https://www.supabets.co.za/login", {
        waitUntil: "networkidle2",
        timeout: 60000,
      })

      // Fill in login form
      await page.waitForSelector("input[name='username']", { timeout: 30000 })
      await page.type("input[name='username']", bookmaker.username)
      await page.type("input[name='password']", bookmaker.password)

      // Click login button
      await page.click("button[type='submit']")

      // Wait for login to complete
      await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 })

      // Update balance in localStorage if we're in the browser
      if (typeof window !== "undefined") {
        try {
          // Extract balance
          const balance = await page.evaluate(() => {
            const balanceElement =
              document.querySelector(".balance") ||
              document.querySelector(".account-balance") ||
              document.querySelector(".user-balance")
            return balanceElement ? balanceElement.textContent.trim() : null
          })

          if (balance) {
            const savedBookmakers = localStorage.getItem("linkedBookmakers")
            if (savedBookmakers) {
              const bookmakers = JSON.parse(savedBookmakers)
              const updatedBookmakers = bookmakers.map((b: LinkedBookmaker) =>
                b.id === bookmaker.id ? { ...b, balance, lastUpdated: new Date().toISOString(), isLoggedIn: true } : b,
              )
              localStorage.setItem("linkedBookmakers", JSON.stringify(updatedBookmakers))
            }
          }
        } catch (e) {
          console.error("Error updating balance:", e)
        }
      }

      // Navigate to the soccer page
      await page.goto("https://www.supabets.co.za/sports/soccer", {
        waitUntil: "networkidle2",
        timeout: 60000,
      })

      // Wait for the content to load
      await page.waitForSelector(".event-list", { timeout: 60000 })

      // Extract the data
      const events = await page.evaluate(() => {
        const eventElements = document.querySelectorAll(".event-item")
        const extractedEvents = []

        for (let i = 0; i < Math.min(eventElements.length, 10); i++) {
          const el = eventElements[i]

          const eventName = el.querySelector(".event-name")?.textContent?.trim() || "Unknown Event"
          const eventTime = el.querySelector(".event-time")?.textContent?.trim() || "Unknown Time"
          const eventUrl = el.querySelector("a")?.href || "#"

          const outcomes = []
          const outcomeElements = el.querySelectorAll(".market-option")

          for (let j = 0; j < outcomeElements.length; j++) {
            const outcome = outcomeElements[j]
            const name = outcome.querySelector(".option-name")?.textContent?.trim() || "Unknown"
            const oddsText = outcome.querySelector(".odds")?.textContent?.trim() || "1.0"
            const odds = Number.parseFloat(oddsText)
            const team = outcome.querySelector(".team-name")?.textContent?.trim() || ""

            outcomes.push({ name, odds, team })
          }

          if (outcomes.length > 0) {
            extractedEvents.push({
              id: `supabets-${i}`,
              event: eventName,
              sport: "Soccer",
              time: eventTime,
              outcomes,
              url: eventUrl,
              bookmaker: "Supabets",
            })
          }
        }

        return extractedEvents
      })

      return events
    } catch (error) {
      console.error("Error scraping Supabets with authentication:", error)
      throw new Error(`Failed to scrape Supabets: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      await browser.close()
    }
  }

  // Main method to scrape all bookmakers using authenticated accounts
  async scrapeAllBookmakers(): Promise<ScrapingResult> {
    const scrapingErrors: { bookmaker: string; error: string }[] = []
    let allEvents: ScrapedEvent[] = []

    // Get active bookmakers - only in browser environment
    const activeBookmakers = typeof window !== "undefined" ? this.getActiveBookmakers() : []

    if (activeBookmakers.length === 0) {
      return {
        events: [],
        scrapingErrors: [
          {
            bookmaker: "All",
            error: "No active bookmaker accounts found. Please add and activate your bookmaker accounts.",
          },
        ],
      }
    }

    // Try to scrape each bookmaker
    for (const bookmaker of activeBookmakers) {
      try {
        let events: ScrapedEvent[] = []

        switch (bookmaker.id) {
          case "betway":
            events = await this.scrapeBetway(bookmaker)
            break
          case "hollywoodbets":
            events = await this.scrapeHollywoodbets(bookmaker)
            break
          case "sportingbet":
            events = await this.scrapeSportingbet(bookmaker)
            break
          case "supabets":
            events = await this.scrapeSupabets(bookmaker)
            break
          default:
            // Skip unsupported bookmakers
            scrapingErrors.push({
              bookmaker: bookmaker.name,
              error: "Scraping not implemented for this bookmaker",
            })
            continue
        }

        allEvents = [...allEvents, ...events]
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`Error scraping ${bookmaker.name}:`, errorMessage)
        scrapingErrors.push({
          bookmaker: bookmaker.name,
          error: errorMessage,
        })
      }
    }

    return {
      events: allEvents,
      scrapingErrors,
    }
  }
}

// Create a singleton instance
export const authenticatedScraper = new AuthenticatedScraper()
