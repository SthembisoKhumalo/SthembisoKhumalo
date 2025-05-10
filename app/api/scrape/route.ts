import { NextResponse } from "next/server"
import { bookmakerScraper } from "@/lib/scraper-service"

export async function GET() {
  try {
    const events = await bookmakerScraper.scrapeAllBookmakers()
    return NextResponse.json({ success: true, events })
  } catch (error) {
    console.error("Error in scrape API:", error)
    return NextResponse.json({ success: false, error: "Failed to scrape bookmaker data" }, { status: 500 })
  }
}
