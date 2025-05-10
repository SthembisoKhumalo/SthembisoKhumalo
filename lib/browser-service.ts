import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"

// Configure browser launch options
const getBrowser = async () => {
  // Use Chrome installed on the system in development
  if (process.env.NODE_ENV === "development") {
    return puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
  }

  // Use Chromium in production (for serverless environments)
  chromium.setHeadlessMode = true
  const executablePath = await chromium.executablePath()

  return puppeteer.launch({
    args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: "new",
    ignoreHTTPSErrors: true,
  })
}

export { getBrowser }
