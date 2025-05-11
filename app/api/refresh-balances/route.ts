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

    // Process each bookmaker
    const results = []

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
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    )

    // Set a shorter default timeout
    page.setDefaultTimeout(15000)

    // Set viewport to desktop size
    await page.setViewport({ width: 1280, height: 800 })

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
        return {
          id: bookmaker.id,
          success: false,
          error: `Scraping not implemented for ${bookmaker.id}`,
        }
    }
  } finally {
    await browser.close()
  }
}

async function scrapeBetwayBalance(page, bookmaker) {
  try {
    console.log(`Starting to scrape Betway balance for ${bookmaker.username}`)

    // Navigate to the login page
    await page.goto("https://www.betway.co.za/", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    })

    console.log("Loaded Betway homepage")

    // Check if there's a login button and click it
    const hasLoginButton = await page.evaluate(() => {
      const loginButton = document.querySelector('a[href*="login"], button:contains("Login"), .login-button')
      if (loginButton) {
        loginButton.click()
        return true
      }
      return false
    })

    if (hasLoginButton) {
      console.log("Clicked login button")
      // Wait for navigation after clicking login button
      await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {
        console.log("Navigation timeout after clicking login button - continuing anyway")
      })
    }

    // Check if already logged in
    const isLoggedIn = await page.evaluate(() => {
      return (
        window.location.href.includes("IsLoggedIn=true") ||
        document.querySelector(".account-balance, .balance, .user-balance") !== null
      )
    })

    if (isLoggedIn) {
      console.log("Already logged in to Betway")

      // Extract balance if already logged in
      const balance = await page.evaluate(() => {
        const balanceElement =
          document.querySelector(".balance-amount") ||
          document.querySelector(".account-balance") ||
          document.querySelector(".user-balance") ||
          document.querySelector(".balance")
        return balanceElement ? balanceElement.textContent.trim() : null
      })

      if (balance) {
        return {
          id: bookmaker.id,
          success: true,
          balance,
          isLoggedIn: true,
        }
      }
    }

    console.log("Looking for login form")

    // Try multiple selectors for the login form
    const usernameSelectors = [
      'input[name="username"]',
      'input[type="text"][placeholder*="username" i]',
      'input[type="text"][placeholder*="email" i]',
      'input[type="email"]',
      "input.username",
      "#username",
    ]

    const passwordSelectors = ['input[name="password"]', 'input[type="password"]', "#password"]

    // Try to find username field
    let usernameField = null
    for (const selector of usernameSelectors) {
      try {
        usernameField = await page.$(selector)
        if (usernameField) {
          console.log(`Found username field with selector: ${selector}`)
          break
        }
      } catch (e) {
        console.log(`Selector ${selector} not found`)
      }
    }

    if (!usernameField) {
      throw new Error("Could not find username field on login page")
    }

    // Try to find password field
    let passwordField = null
    for (const selector of passwordSelectors) {
      try {
        passwordField = await page.$(selector)
        if (passwordField) {
          console.log(`Found password field with selector: ${selector}`)
          break
        }
      } catch (e) {
        console.log(`Selector ${selector} not found`)
      }
    }

    if (!passwordField) {
      throw new Error("Could not find password field on login page")
    }

    // Fill in the form
    await usernameField.type(bookmaker.username)
    await passwordField.type(bookmaker.password)

    console.log("Filled in login form")

    // Find and click the login button
    const loginButtonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:contains("Login")',
      'button:contains("Sign In")',
      ".login-button",
      ".sign-in-button",
    ]

    let loginButton = null
    for (const selector of loginButtonSelectors) {
      try {
        if (selector.includes(":contains")) {
          // Handle text content selectors
          const buttonText = selector.match(/:contains$$"(.+)"$$/)[1]
          loginButton = await page.evaluateHandle((text) => {
            return Array.from(document.querySelectorAll("button")).find((el) =>
              el.textContent.trim().toLowerCase().includes(text.toLowerCase()),
            )
          }, buttonText)
        } else {
          loginButton = await page.$(selector)
        }

        if (loginButton) {
          console.log(`Found login button with selector: ${selector}`)
          break
        }
      } catch (e) {
        console.log(`Login button selector ${selector} not found`)
      }
    }

    if (!loginButton) {
      throw new Error("Could not find login button")
    }

    // Click the login button
    await loginButton.click()
    console.log("Clicked login button")

    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {
      console.log("Navigation timeout after login - continuing anyway")
    })

    // Wait for account page to load
    await page.waitForTimeout(3000)

    console.log("Checking if login was successful")

    // Check if login was successful
    const loginSuccessful = await page.evaluate(() => {
      return (
        document.querySelector(".account-balance, .balance, .user-balance, .balance-amount") !== null ||
        window.location.href.includes("account") ||
        window.location.href.includes("myaccount")
      )
    })

    if (!loginSuccessful) {
      throw new Error("Login failed - could not find balance or account information")
    }

    // Extract balance
    const balance = await page.evaluate(() => {
      const balanceElement =
        document.querySelector(".balance-amount") ||
        document.querySelector(".account-balance") ||
        document.querySelector(".user-balance") ||
        document.querySelector(".balance")
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
    return {
      id: bookmaker.id,
      success: false,
      error: `Failed to scrape Betway balance: ${error.message}`,
    }
  }
}

async function scrapeHollywoodbetsBalance(page, bookmaker) {
  try {
    console.log(`Starting to scrape Hollywoodbets balance for ${bookmaker.username}`)

    // Navigate to the login page
    await page.goto("https://www.hollywoodbets.net/", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    })

    console.log("Loaded Hollywoodbets homepage")

    // Check if there's a login button and click it
    const hasLoginButton = await page.evaluate(() => {
      const loginButton = document.querySelector('a[href*="login"], button:contains("Login"), .login-button')
      if (loginButton) {
        loginButton.click()
        return true
      }
      return false
    })

    if (hasLoginButton) {
      console.log("Clicked login button")
      // Wait for navigation after clicking login button
      await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {
        console.log("Navigation timeout after clicking login button - continuing anyway")
      })
    }

    // Try multiple selectors for the login form
    const usernameSelectors = [
      "#username",
      'input[name="username"]',
      'input[type="text"][placeholder*="username" i]',
      'input[type="text"][placeholder*="email" i]',
      'input[type="email"]',
      "input.username",
    ]

    const passwordSelectors = ["#password", 'input[name="password"]', 'input[type="password"]']

    // Try to find username field
    let usernameField = null
    for (const selector of usernameSelectors) {
      try {
        usernameField = await page.$(selector)
        if (usernameField) {
          console.log(`Found username field with selector: ${selector}`)
          break
        }
      } catch (e) {
        console.log(`Selector ${selector} not found`)
      }
    }

    if (!usernameField) {
      throw new Error("Could not find username field on login page")
    }

    // Try to find password field
    let passwordField = null
    for (const selector of passwordSelectors) {
      try {
        passwordField = await page.$(selector)
        if (passwordField) {
          console.log(`Found password field with selector: ${selector}`)
          break
        }
      } catch (e) {
        console.log(`Selector ${selector} not found`)
      }
    }

    if (!passwordField) {
      throw new Error("Could not find password field on login page")
    }

    // Fill in the form
    await usernameField.type(bookmaker.username)
    await passwordField.type(bookmaker.password)

    console.log("Filled in login form")

    // Find and click the login button
    const loginButtonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:contains("Login")',
      'button:contains("Sign In")',
      ".login-button",
      ".sign-in-button",
    ]

    let loginButton = null
    for (const selector of loginButtonSelectors) {
      try {
        if (selector.includes(":contains")) {
          // Handle text content selectors
          const buttonText = selector.match(/:contains$$"(.+)"$$/)[1]
          loginButton = await page.evaluateHandle((text) => {
            return Array.from(document.querySelectorAll("button")).find((el) =>
              el.textContent.trim().toLowerCase().includes(text.toLowerCase()),
            )
          }, buttonText)
        } else {
          loginButton = await page.$(selector)
        }

        if (loginButton) {
          console.log(`Found login button with selector: ${selector}`)
          break
        }
      } catch (e) {
        console.log(`Login button selector ${selector} not found`)
      }
    }

    if (!loginButton) {
      throw new Error("Could not find login button")
    }

    // Click the login button
    await loginButton.click()
    console.log("Clicked login button")

    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {
      console.log("Navigation timeout after login - continuing anyway")
    })

    // Wait for account page to load
    await page.waitForTimeout(3000)

    console.log("Checking if login was successful")

    // Extract balance
    const balance = await page.evaluate(() => {
      const balanceElement =
        document.querySelector(".account-balance") ||
        document.querySelector(".balance-amount") ||
        document.querySelector(".user-balance") ||
        document.querySelector(".balance")
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
    return {
      id: bookmaker.id,
      success: false,
      error: `Failed to scrape Hollywoodbets balance: ${error.message}`,
    }
  }
}

async function scrapeSportingbetBalance(page, bookmaker) {
  try {
    console.log(`Starting to scrape Sportingbet balance for ${bookmaker.username}`)

    // Navigate to the login page
    await page.goto("https://www.sportingbet.co.za/", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    })

    console.log("Loaded Sportingbet homepage")

    // Check if there's a login button and click it
    const hasLoginButton = await page.evaluate(() => {
      const loginButton = document.querySelector('a[href*="login"], button:contains("Login"), .login-button')
      if (loginButton) {
        loginButton.click()
        return true
      }
      return false
    })

    if (hasLoginButton) {
      console.log("Clicked login button")
      // Wait for navigation after clicking login button
      await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {
        console.log("Navigation timeout after clicking login button - continuing anyway")
      })
    }

    // Try multiple selectors for the login form
    const usernameSelectors = [
      'input[name="username"]',
      'input[type="text"][placeholder*="username" i]',
      'input[type="text"][placeholder*="email" i]',
      'input[type="email"]',
      "input.username",
      "#username",
    ]

    const passwordSelectors = ['input[name="password"]', 'input[type="password"]', "#password"]

    // Try to find username field
    let usernameField = null
    for (const selector of usernameSelectors) {
      try {
        usernameField = await page.$(selector)
        if (usernameField) {
          console.log(`Found username field with selector: ${selector}`)
          break
        }
      } catch (e) {
        console.log(`Selector ${selector} not found`)
      }
    }

    if (!usernameField) {
      throw new Error("Could not find username field on login page")
    }

    // Try to find password field
    let passwordField = null
    for (const selector of passwordSelectors) {
      try {
        passwordField = await page.$(selector)
        if (passwordField) {
          console.log(`Found password field with selector: ${selector}`)
          break
        }
      } catch (e) {
        console.log(`Selector ${selector} not found`)
      }
    }

    if (!passwordField) {
      throw new Error("Could not find password field on login page")
    }

    // Fill in the form
    await usernameField.type(bookmaker.username)
    await passwordField.type(bookmaker.password)

    console.log("Filled in login form")

    // Find and click the login button
    const loginButtonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:contains("Login")',
      'button:contains("Sign In")',
      ".login-button",
      ".sign-in-button",
    ]

    let loginButton = null
    for (const selector of loginButtonSelectors) {
      try {
        if (selector.includes(":contains")) {
          // Handle text content selectors
          const buttonText = selector.match(/:contains$$"(.+)"$$/)[1]
          loginButton = await page.evaluateHandle((text) => {
            return Array.from(document.querySelectorAll("button")).find((el) =>
              el.textContent.trim().toLowerCase().includes(text.toLowerCase()),
            )
          }, buttonText)
        } else {
          loginButton = await page.$(selector)
        }

        if (loginButton) {
          console.log(`Found login button with selector: ${selector}`)
          break
        }
      } catch (e) {
        console.log(`Login button selector ${selector} not found`)
      }
    }

    if (!loginButton) {
      throw new Error("Could not find login button")
    }

    // Click the login button
    await loginButton.click()
    console.log("Clicked login button")

    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {
      console.log("Navigation timeout after login - continuing anyway")
    })

    // Wait for account page to load
    await page.waitForTimeout(3000)

    console.log("Checking if login was successful")

    // Extract balance
    const balance = await page.evaluate(() => {
      const balanceElement =
        document.querySelector(".account-balance") ||
        document.querySelector(".balance-amount") ||
        document.querySelector(".user-balance") ||
        document.querySelector(".balance")
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
    return {
      id: bookmaker.id,
      success: false,
      error: `Failed to scrape Sportingbet balance: ${error.message}`,
    }
  }
}

async function scrapeSupabetsBalance(page, bookmaker) {
  try {
    console.log(`Starting to scrape Supabets balance for ${bookmaker.username}`)

    // Navigate to the login page
    await page.goto("https://www.supabets.co.za/", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    })

    console.log("Loaded Supabets homepage")

    // Check if there's a login button and click it
    const hasLoginButton = await page.evaluate(() => {
      const loginButton = document.querySelector('a[href*="login"], button:contains("Login"), .login-button')
      if (loginButton) {
        loginButton.click()
        return true
      }
      return false
    })

    if (hasLoginButton) {
      console.log("Clicked login button")
      // Wait for navigation after clicking login button
      await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {
        console.log("Navigation timeout after clicking login button - continuing anyway")
      })
    }

    // Try multiple selectors for the login form
    const usernameSelectors = [
      'input[name="username"]',
      'input[type="text"][placeholder*="username" i]',
      'input[type="text"][placeholder*="email" i]',
      'input[type="email"]',
      "input.username",
      "#username",
    ]

    const passwordSelectors = ['input[name="password"]', 'input[type="password"]', "#password"]

    // Try to find username field
    let usernameField = null
    for (const selector of usernameSelectors) {
      try {
        usernameField = await page.$(selector)
        if (usernameField) {
          console.log(`Found username field with selector: ${selector}`)
          break
        }
      } catch (e) {
        console.log(`Selector ${selector} not found`)
      }
    }

    if (!usernameField) {
      throw new Error("Could not find username field on login page")
    }

    // Try to find password field
    let passwordField = null
    for (const selector of passwordSelectors) {
      try {
        passwordField = await page.$(selector)
        if (passwordField) {
          console.log(`Found password field with selector: ${selector}`)
          break
        }
      } catch (e) {
        console.log(`Selector ${selector} not found`)
      }
    }

    if (!passwordField) {
      throw new Error("Could not find password field on login page")
    }

    // Fill in the form
    await usernameField.type(bookmaker.username)
    await passwordField.type(bookmaker.password)

    console.log("Filled in login form")

    // Find and click the login button
    const loginButtonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:contains("Login")',
      'button:contains("Sign In")',
      ".login-button",
      ".sign-in-button",
    ]

    let loginButton = null
    for (const selector of loginButtonSelectors) {
      try {
        if (selector.includes(":contains")) {
          // Handle text content selectors
          const buttonText = selector.match(/:contains$$"(.+)"$$/)[1]
          loginButton = await page.evaluateHandle((text) => {
            return Array.from(document.querySelectorAll("button")).find((el) =>
              el.textContent.trim().toLowerCase().includes(text.toLowerCase()),
            )
          }, buttonText)
        } else {
          loginButton = await page.$(selector)
        }

        if (loginButton) {
          console.log(`Found login button with selector: ${selector}`)
          break
        }
      } catch (e) {
        console.log(`Login button selector ${selector} not found`)
      }
    }

    if (!loginButton) {
      throw new Error("Could not find login button")
    }

    // Click the login button
    await loginButton.click()
    console.log("Clicked login button")

    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {
      console.log("Navigation timeout after login - continuing anyway")
    })

    // Wait for account page to load
    await page.waitForTimeout(3000)

    console.log("Checking if login was successful")

    // Extract balance
    const balance = await page.evaluate(() => {
      const balanceElement =
        document.querySelector(".balance") ||
        document.querySelector(".account-balance") ||
        document.querySelector(".user-balance") ||
        document.querySelector(".balance-amount")
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
    return {
      id: bookmaker.id,
      success: false,
      error: `Failed to scrape Supabets balance: ${error.message}`,
    }
  }
}
