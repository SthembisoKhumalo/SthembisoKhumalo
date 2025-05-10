"use client"

import { useState, useEffect } from "react"
import type { ArbitrageOpportunity } from "@/lib/scraper-service"
import { toast } from "@/components/ui/use-toast"
import { arbitrageService } from "@/lib/arbitrage-service"

export function useArbitrageData() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isMockData, setIsMockData] = useState(false)
  const [scrapingErrors, setScrapingErrors] = useState<{ bookmaker: string; error: string }[]>([])
  const [allScrapingFailed, setAllScrapingFailed] = useState(false)
  const [usingAuthenticatedAccounts, setUsingAuthenticatedAccounts] = useState(false)

  const fetchOpportunities = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get linked bookmakers from localStorage
      let linkedBookmakers = []
      if (typeof window !== "undefined") {
        try {
          const savedBookmakers = localStorage.getItem("linkedBookmakers")
          if (savedBookmakers) {
            linkedBookmakers = JSON.parse(savedBookmakers)
              .filter((b: any) => b.active && b.isLoggedIn)
              .map((b: any) => ({
                id: b.id,
                name: b.name,
                username: b.username,
                password: b.password,
              }))
          }
        } catch (e) {
          console.error("Error loading bookmakers:", e)
        }
      }

      // If we have linked bookmakers, use them to scrape odds
      if (linkedBookmakers.length > 0) {
        try {
          const response = await fetch("/api/odds", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ bookmakers: linkedBookmakers }),
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch odds: ${response.status}`)
          }

          const data = await response.json()

          if (data.success) {
            // Extract all events from all bookmakers
            const allEvents = data.results
              .filter((result: any) => result.success)
              .flatMap((result: any) => result.events)

            // Find arbitrage opportunities
            const arbitrageOpportunities = arbitrageService.findArbitrageOpportunities(allEvents)

            setOpportunities(arbitrageOpportunities)
            setLastUpdated(new Date())
            setIsMockData(false)
            setUsingAuthenticatedAccounts(true)

            // Collect errors
            const errors = data.results
              .filter((result: any) => !result.success)
              .map((result: any) => ({
                bookmaker: result.id,
                error: result.error,
              }))

            setScrapingErrors(errors)
            setAllScrapingFailed(errors.length === linkedBookmakers.length)

            if (arbitrageOpportunities.length > 0) {
              toast({
                title: "Opportunities Updated",
                description: `Found ${arbitrageOpportunities.length} arbitrage opportunities`,
                variant: "success",
              })
            } else {
              toast({
                title: "No Opportunities Found",
                description: "Try again later or add more bookmaker accounts",
              })
            }

            return
          }
        } catch (err) {
          console.error("Error fetching odds with authenticated accounts:", err)
          // Fall back to the regular API
        }
      }

      // Fall back to the regular API if no linked bookmakers or if scraping failed
      const response = await fetch("/api/opportunities")

      if (!response.ok) {
        throw new Error(`Failed to fetch opportunities: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setOpportunities(data.opportunities)
        setLastUpdated(new Date(data.lastUpdated || Date.now()))
        setIsMockData(data.usingMockData)
        setScrapingErrors(data.scrapingErrors || [])
        setAllScrapingFailed(data.allScrapingFailed || false)
        setUsingAuthenticatedAccounts(data.usingAuthenticatedAccounts || false)

        if (data.allScrapingFailed) {
          toast({
            title: "Scraping Failed",
            description: "Could not access real-time data from any bookmaker. Please check your account credentials.",
            variant: "destructive",
          })
        } else if (data.scrapingErrors && data.scrapingErrors.length > 0) {
          toast({
            title: "Partial Data Access",
            description: `Could not access data from ${data.scrapingErrors.length} bookmaker(s). Some data may be incomplete.`,
            variant: "warning",
          })
        }

        if (data.usingAuthenticatedAccounts) {
          toast({
            title: "Using Authenticated Accounts",
            description: "Successfully retrieved real-time data using your bookmaker accounts.",
            variant: "success",
          })
        }

        if (data.opportunities.length > 0) {
          toast({
            title: "Opportunities Updated",
            description: `Found ${data.opportunities.length} arbitrage opportunities`,
            variant: "success",
          })
        } else {
          toast({
            title: "No Opportunities Found",
            description: "Try again later or add more bookmaker accounts",
          })
        }
      } else {
        throw new Error(data.error || "Failed to fetch opportunities")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Error Fetching Data",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchOpportunities()

    // Set up interval to fetch data every 5 minutes
    const intervalId = setInterval(fetchOpportunities, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  return {
    opportunities,
    isLoading,
    error,
    lastUpdated,
    isMockData,
    scrapingErrors,
    allScrapingFailed,
    usingAuthenticatedAccounts,
    refreshData: fetchOpportunities,
  }
}
