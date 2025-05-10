import { NextResponse } from "next/server"
import { getBrowser } from "@/lib/browser-service"

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

    const results = []

    // Process each bookmaker
    for (const bookmaker of bookmakers) {
      try {
        // Get the balance for this bookmaker
        const result = await fetchBookmakerBalance(bookmaker)
        results.push(result)
      } catch (error) {
        console.error(`Error processing bookmaker ${bookmaker.id}:`, error)
        results.push({
          id: bookmaker.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Error in refresh-balances API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh balances",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function fetchBookmakerBalance(bookmaker) {
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
        return await scrapeBetwayBalance(page, bookmaker)
      case "hollywoodbets":
        return await scrapeHollywoodbetsBalance(page, bookmaker)
      case "sportingbet":
        return await scrapeSportingbetBalance(page, bookmaker)
      case "supabets":
        return await scrapeSupabetsBalance(page, bookmaker)
      default:
        throw new Error(`Scraping not implemented for ${bookmaker.id}`)
    }
  } finally {
    await browser.close()
  }
}

async function scrapeBetwayBalance(page, bookmaker) {
  try {
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
      // Fill login form
      await page.waitForSelector("input[name='username']", { timeout: 30000 })
      await page.type("input[name='username']", bookmaker.username)
      await page.type("input[name='password']", bookmaker.password)

      // Click login button
      await page.click("button[type='submit']")

      // Wait for navigation to complete
      await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 })
    }

    // Navigate to account page
    await page.goto("https://www.betway.co.za/myaccount/summary", {
      waitUntil: "networkidle2",
      timeout: 30000,
    })

    // Extract balance
    const balance = await page.evaluate(() => {
      const balanceElement =
        document.querySelector(".balance-amount") ||
        document.querySelector(".account-balance") ||
        document.querySelector(".user-balance")
      return balanceElement ? balanceElement.textContent.trim() : null
    })

    if (!balance) {
      throw new Error("Could not find balance on account page")
    }

    return {
      id: bookmaker.id,
      success: true,
      balance,
      isLoggedIn: true,
    }
  } catch (error) {
    console.error("Error scraping Betway balance:", error)
    throw new Error(`Failed to scrape Betway balance: ${error.message}`)
  }
}

async function scrapeHollywoodbetsBalance(page, bookmaker) {
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

    // Extract balance
    const balance = await page.evaluate(() => {
      const balanceElement =
        document.querySelector(".account-balance") ||
        document.querySelector(".balance-amount") ||
        document.querySelector(".user-balance")
      return balanceElement ? balanceElement.textContent.trim() : null
    })

    if (!balance) {
      throw new Error("Could not find balance on account page")
    }

    return {
      id: bookmaker.id,
      success: true,
      balance,
      isLoggedIn: true,
    }
  } catch (error) {
    console.error("Error scraping Hollywoodbets balance:", error)
    throw new Error(`Failed to scrape Hollywoodbets balance: ${error.message}`)
  }
}

async function scrapeSportingbetBalance(page, bookmaker) {
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

    // Extract balance
    const balance = await page.evaluate(() => {
      const balanceElement =
        document.querySelector(".account-balance") ||
        document.querySelector(".balance-amount") ||
        document.querySelector(".user-balance")
      return balanceElement ? balanceElement.textContent.trim() : null
    })

    if (!balance) {
      throw new Error("Could not find balance on account page")
    }

    return {
      id: bookmaker.id,
      success: true,
      balance,
      isLoggedIn: true,
    }
  } catch (error) {
    console.error("Error scraping Sportingbet balance:", error)
    throw new Error(`Failed to scrape Sportingbet balance: ${error.message}`)
  }
}

async function scrapeSupabetsBalance(page, bookmaker) {
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

    // Extract balance
    const balance = await page.evaluate(() => {
      const balanceElement =
        document.querySelector(".balance") ||
        document.querySelector(".account-balance") ||
        document.querySelector(".user-balance")
      return balanceElement ? balanceElement.textContent.trim() : null
    })

    if (!balance) {
      throw new Error("Could not find balance on account page")
    }

    return {
      id: bookmaker.id,
      success: true,
      balance,
      isLoggedIn: true,
    }
  } catch (error) {
    console.error("Error scraping Supabets balance:", error)
    throw new Error(`Failed to scrape Supabets balance: ${error.message}`)
  }
}
