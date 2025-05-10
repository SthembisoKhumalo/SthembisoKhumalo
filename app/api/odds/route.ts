import { NextResponse } from "next/server"
import { getBrowser } from "@/lib/browser-service"

// This function will scrape odds from a bookmaker's website using real accounts
async function scrapeOdds(bookmaker: any) {
  const browser = await getBrowser()

  try {
    const page = await browser.newPage()

    // Set user agent to appear as a regular browser
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    )

    // Handle different bookmakers
    switch (bookmaker.id) {
      case "betway":
        try {
          // Navigate to the login page
          await page.goto("https://www.betway.co.za/login", {
            waitUntil: "networkidle2",
            timeout: 60000,
          })

          // Check if already logged in
          const isLoggedIn = await page.evaluate(() => {
            return (
              window.location.href.includes("IsLoggedIn=true") || document.querySelector(".account-balance") !== null
            )
          })

          if (!isLoggedIn) {
            // Fill login form
            await page.waitForSelector("input[name='username']", { timeout: 10000 })
            await page.type("input[name='username']", bookmaker.username)
            await page.type("input[name='password']", bookmaker.password)

            // Click login button
            await page.click("button[type='submit']")

            // Wait for navigation to complete
            await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 })
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

          return { success: true, events }
        } catch (error) {
          console.error("Error scraping Betway odds:", error)
          return {
            success: false,
            error: `Failed to scrape Betway odds: ${error instanceof Error ? error.message : String(error)}`,
          }
        }

      case "hollywoodbets":
        try {
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

          return { success: true, events }
        } catch (error) {
          console.error("Error scraping Hollywoodbets odds:", error)
          return {
            success: false,
            error: `Failed to scrape Hollywoodbets odds: ${error instanceof Error ? error.message : String(error)}`,
          }
        }

      case "sportingbet":
        try {
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

          return { success: true, events }
        } catch (error) {
          console.error("Error scraping Sportingbet odds:", error)
          return {
            success: false,
            error: `Failed to scrape Sportingbet odds: ${error instanceof Error ? error.message : String(error)}`,
          }
        }

      case "supabets":
        try {
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

          return { success: true, events }
        } catch (error) {
          console.error("Error scraping Supabets odds:", error)
          return {
            success: false,
            error: `Failed to scrape Supabets odds: ${error instanceof Error ? error.message : String(error)}`,
          }
        }

      // Add cases for other bookmakers
      default:
        return { success: false, error: `Scraping not implemented for ${bookmaker.id}` }
    }
  } catch (error) {
    console.error(`Error scraping ${bookmaker.id} odds:`, error)
    return {
      success: false,
      error: `Failed to scrape odds: ${error instanceof Error ? error.message : String(error)}`,
    }
  } finally {
    await browser.close()
  }
}

export async function POST(request: Request) {
  try {
    const { bookmakers } = await request.json()

    if (!bookmakers || !Array.isArray(bookmakers) || bookmakers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No bookmakers provided",
        },
        { status: 400 },
      )
    }

    // Process each bookmaker
    const results = []

    for (const bookmaker of bookmakers) {
      // Scrape the odds using real accounts
      const result = await scrapeOdds(bookmaker)

      results.push({
        id: bookmaker.id,
        success: result.success,
        events: result.success ? result.events : [],
        error: result.success ? undefined : result.error,
      })
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Error in odds API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to scrape odds",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
