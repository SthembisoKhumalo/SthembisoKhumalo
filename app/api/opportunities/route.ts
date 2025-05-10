import { NextResponse } from "next/server"
import { authenticatedScraper } from "@/lib/auth-scraper-service"
import { arbitrageService } from "@/lib/arbitrage-service"

export async function GET() {
  try {
    // First try to get data using authenticated accounts
    const scrapingResult = await authenticatedScraper.scrapeAllBookmakers()

    // If no events were found with authenticated accounts, return appropriate error
    if (scrapingResult.events.length === 0) {
      return NextResponse.json({
        success: true,
        opportunities: [],
        scrapingErrors: scrapingResult.scrapingErrors,
        allScrapingFailed: true,
        lastUpdated: new Date().toISOString(),
        usingAuthenticatedAccounts: false,
        message:
          "No active bookmaker accounts found or all scraping failed. Please add and activate your bookmaker accounts.",
      })
    }

    // Find arbitrage opportunities using real data
    const opportunities = arbitrageService.findArbitrageOpportunities(scrapingResult.events)

    return NextResponse.json({
      success: true,
      opportunities,
      scrapingErrors: scrapingResult.scrapingErrors,
      allScrapingFailed: false,
      lastUpdated: new Date().toISOString(),
      usingAuthenticatedAccounts: true,
    })
  } catch (error) {
    console.error("Error in opportunities API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to find arbitrage opportunities",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
