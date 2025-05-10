"use client"

import { useState, useEffect } from "react"
import ArbitrageTable from "@/components/arbitrage-table"
import SearchFilters from "@/components/search-filters"
import BookmakerManager from "@/components/bookmaker-manager"
import AddOpportunityForm from "@/components/add-opportunity-form"
import { Search, Bell, RefreshCw, AlertTriangle, XCircle, Info, Lock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toaster } from "@/components/ui/toaster"
import UserSettings from "@/components/user-settings"
import { useArbitrageData } from "@/hooks/use-arbitrage-data"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Home() {
  const {
    opportunities,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    isMockData,
    scrapingErrors,
    allScrapingFailed,
    usingAuthenticatedAccounts,
  } = useArbitrageData()

  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    sport: "all",
    bookmaker: "all",
    minProfit: 2,
    timeFrame: "24h",
    twoWayOnly: true,
  })

  // State for connected accounts count
  const [connectedAccountsCount, setConnectedAccountsCount] = useState(0)

  // Update connected accounts count when component mounts (client-side only)
  useEffect(() => {
    try {
      const savedBookmakers = localStorage.getItem("linkedBookmakers")
      if (savedBookmakers) {
        const bookmakers = JSON.parse(savedBookmakers)
        setConnectedAccountsCount(bookmakers.filter((b: any) => b.active).length)
      }
    } catch (e) {
      console.error("Error loading bookmakers:", e)
    }
  }, [])

  const handleAddOpportunity = (newOpportunity: any) => {
    // This is now handled by the scraper, but we'll keep the function for manual additions
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  // Apply filters to opportunities
  const filteredData = opportunities.filter((item) => {
    // Search term filter
    if (
      searchTerm &&
      !item.event.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.sport.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.bookmakers.some((b) => b.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false
    }

    // Sport filter
    if (filters.sport !== "all" && item.sport.toLowerCase() !== filters.sport.toLowerCase()) {
      return false
    }

    // Bookmaker filter
    if (
      filters.bookmaker !== "all" &&
      !item.bookmakers.some((b) => b.toLowerCase() === filters.bookmaker.toLowerCase())
    ) {
      return false
    }

    // Minimum profit filter
    if (item.profit < filters.minProfit) {
      return false
    }

    return true
  })

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 py-3 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary/20 rounded flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="#00B4D8" strokeWidth="2" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-primary">
              ARBITRAGE<span className="text-foreground">OS</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search opportunities..."
                className="w-64 pl-9 bg-muted border-muted rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="h-5 w-5" />
            </Button>
            <UserSettings />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border/40 p-4 hidden md:block">
          <nav className="space-y-1">
            <Button variant="secondary" className="w-full justify-start gap-3 mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="#00B4D8" strokeWidth="2" />
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="#00B4D8" strokeWidth="2" />
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="#00B4D8" strokeWidth="2" />
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="#00B4D8" strokeWidth="2" />
              </svg>
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2 12H4M20 12H22M12 2V4M12 20V22M6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12Z"
                  stroke="#94A3B8"
                  strokeWidth="2"
                />
              </svg>
              Opportunities
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#94A3B8" strokeWidth="2" />
                <path d="M2 17L12 22L22 17" stroke="#94A3B8" strokeWidth="2" />
                <path d="M2 12L12 17L22 12" stroke="#94A3B8" strokeWidth="2" />
              </svg>
              Bookmakers
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8"
                  stroke="#94A3B8"
                  strokeWidth="2"
                />
                <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="#94A3B8" strokeWidth="2" />
              </svg>
              History
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="#94A3B8"
                  strokeWidth="2"
                />
                <path
                  d="M19.4 15C19.1277 15.8031 19.2583 16.6718 19.7601 17.37C20.2619 17.9281 21.0377 18.2342 21.8208 18.1153C22.604 17.9964 23.2725 17.4674 23.5839 16.7236C23.8954 15.9798 23.8061 15.1305 23.35 14.47C22.8938 13.8095 22.1311 13.4093 21.3311 13.4093C20.5311 13.4093 19.7684 13.8095 19.3123 14.47"
                  stroke="#94A3B8"
                  strokeWidth="2"
                />
                <path
                  d="M4.65001 15C4.37771 15.8031 4.50832 16.6718 5.01014 17.3C5.51197 17.9281 6.28779 18.2342 7.07092 18.1153C7.85405 17.9964 8.52258 17.4674 8.83401 16.7236C9.14544 15.9798 9.05617 15.1305 8.60001 14.47C8.14386 13.8095 7.38113 13.4093 6.58113 13.4093C5.78114 13.4093 5.01841 13.8095 4.56226 14.47"
                  stroke="#94A3B8"
                  strokeWidth="2"
                />
                <path
                  d="M12.0001 8C12.7732 8 13.5136 7.70721 14.0638 7.15704C14.6139 6.60687 14.9067 5.86641 14.9067 5.09334C14.9067 4.32026 14.6139 3.5798 14.0638 3.02963C13.5136 2.47946 12.7732 2.18667 12.0001 2.18667C11.227 2.18667 10.4866 2.47946 9.93639 3.02963C9.38622 3.5798 9.09343 4.32026 9.09343 5.09334C9.09343 5.86641 9.38622 6.60687 9.93639 7.15704C10.4866 7.70721 11.227 8 12.0001 8Z"
                  stroke="#94A3B8"
                  strokeWidth="2"
                />
              </svg>
              Settings
            </Button>
          </nav>

          <div className="mt-8">
            <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">My Bookmakers</h3>
            <BookmakerManager />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2 12H4M20 12H22M12 2V4M12 20V22M6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12Z"
                    stroke="#00B4D8"
                    strokeWidth="2"
                  />
                </svg>
                <h2 className="text-2xl font-bold">System Overview</h2>
              </div>
              <p className="text-muted-foreground mt-1">Monitoring arbitrage opportunities in real-time</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full live-indicator">
                LIVE
              </span>
              <Button onClick={refreshData} variant="outline" size="sm" className="gap-2" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Refreshing..." : "Refresh Data"}
              </Button>
              <AddOpportunityForm onAddOpportunity={handleAddOpportunity} />
            </div>
          </div>

          {/* Last Updated Info */}
          {lastUpdated && (
            <div className="mb-4 text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()} •
              {isLoading ? (
                <span className="ml-2 text-primary animate-pulse">Refreshing data...</span>
              ) : (
                <span className="ml-2">Auto-refreshes every 5 minutes</span>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* No Bookmaker Accounts Alert */}
          {scrapingErrors.some(
            (err) => err.bookmaker === "All" && err.error.includes("No active bookmaker accounts"),
          ) && (
            <Alert className="mb-4 bg-blue-950/20 border-blue-800/30 text-blue-300">
              <Lock className="h-4 w-4" />
              <AlertTitle>No Active Bookmaker Accounts</AlertTitle>
              <AlertDescription className="text-blue-200/80">
                Please add and activate your bookmaker accounts to enable real-time data scraping. Click the "Manage
                Bookmaker Accounts" button in the sidebar to get started.
              </AlertDescription>
            </Alert>
          )}

          {/* Authenticated Success Alert */}
          {usingAuthenticatedAccounts && (
            <Alert className="mb-4 bg-green-950/20 border-green-800/30 text-green-300">
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Using Authenticated Accounts</AlertTitle>
              <AlertDescription className="text-green-200/80">
                Successfully retrieved real-time data using your bookmaker accounts. This provides the most accurate and
                up-to-date odds information.
              </AlertDescription>
            </Alert>
          )}

          {/* Scraping Failed Alert */}
          {allScrapingFailed && !scrapingErrors.some((err) => err.bookmaker === "All") && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Cannot Access Real-Time Data</AlertTitle>
              <AlertDescription>
                Failed to access real-time data from your bookmaker accounts. Please check your credentials and try
                again.
              </AlertDescription>
            </Alert>
          )}

          {/* Partial Scraping Errors */}
          {!allScrapingFailed &&
            scrapingErrors.length > 0 &&
            !scrapingErrors.some((err) => err.bookmaker === "All") && (
              <Alert className="mb-4 bg-amber-950/20 border-amber-800/30 text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Partial Data Access</AlertTitle>
                <AlertDescription className="text-amber-200/80">
                  <p>Could not access data from the following bookmakers:</p>
                  <ul className="list-disc pl-5 mt-2">
                    {scrapingErrors.map((error, index) => (
                      <li key={index}>
                        {error.bookmaker}: {error.error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

          {/* Mock data notice */}
          {isMockData && !allScrapingFailed && (
            <Alert className="mb-4 bg-blue-950/20 border-blue-800/30 text-blue-300">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-200/80">
                Some data is being simulated as we couldn't access all bookmaker websites directly. Add more bookmaker
                accounts to improve data quality.
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-border rounded-lg p-4 card-gradient">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-muted-foreground text-sm">Profit Potential</p>
                  {isLoading ? (
                    <Skeleton className="h-9 w-20 mt-1" />
                  ) : (
                    <h3 className="text-3xl font-bold mt-1">
                      {opportunities.length > 0
                        ? (opportunities.reduce((sum, item) => sum + item.profit, 0) / opportunities.length).toFixed(1)
                        : "0.0"}
                      %
                    </h3>
                  )}
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#00B4D8" strokeWidth="2" />
                    <path d="M2 17L12 22L22 17" stroke="#00B4D8" strokeWidth="2" />
                    <path d="M2 12L12 17L22 12" stroke="#00B4D8" strokeWidth="2" />
                  </svg>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Average across {isLoading ? "..." : opportunities.length} opportunities
              </div>
              <div className="mt-4 h-8 flex items-end">
                <div className="bg-primary/20 w-1/5 h-2 rounded-l-full"></div>
                <div className="bg-primary/40 w-1/5 h-3 "></div>
                <div className="bg-primary/60 w-1/5 h-4"></div>
                <div className="bg-primary/80 w-1/5 h-5"></div>
                <div className="bg-primary w-1/5 h-6 rounded-r-full"></div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 card-gradient">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-muted-foreground text-sm">Total Opportunities</p>
                  {isLoading ? (
                    <Skeleton className="h-9 w-16 mt-1" />
                  ) : (
                    <h3 className="text-3xl font-bold mt-1">{opportunities.length}</h3>
                  )}
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.31 11.14C10.54 10.69 9.97 10.2 9.97 9.47C9.97 8.63 10.76 8.04 12.07 8.04C13.45 8.04 13.97 8.7 14.01 9.68H15.72C15.67 8.34 14.85 7.11 13.23 6.71V5H10.9V6.69C9.39 7.01 8.18 7.99 8.18 9.5C8.18 11.29 9.67 12.19 11.84 12.71C13.79 13.17 14.18 13.86 14.18 14.58C14.18 15.11 13.79 15.97 12.08 15.97C10.48 15.97 9.85 15.25 9.76 14.33H8.04C8.14 16.03 9.4 16.99 10.9 17.3V19H13.24V17.33C14.76 17.04 15.98 16.17 15.98 14.56C15.98 12.36 14.07 11.6 12.31 11.14Z"
                      fill="#00B4D8"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Active betting opportunities</div>
              <div className="mt-4 h-8 flex items-end">
                <div className="bg-primary/20 w-1/5 h-3 rounded-l-full"></div>
                <div className="bg-primary/40 w-1/5 h-4"></div>
                <div className="bg-primary/60 w-1/5 h-5"></div>
                <div className="bg-primary/80 w-1/5 h-6"></div>
                <div className="bg-primary w-1/5 h-7 rounded-r-full"></div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 card-gradient">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-muted-foreground text-sm">Connected Accounts</p>
                  <h3 className="text-3xl font-bold mt-1 text-success">{connectedAccountsCount}</h3>
                </div>
                <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-success" />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Active bookmaker accounts</div>
              <div className="mt-4 h-8 flex items-end">
                <div className="bg-success/20 w-1/5 h-2 rounded-l-full"></div>
                <div className="bg-success/40 w-1/5 h-3"></div>
                <div className="bg-success/60 w-1/5 h-4"></div>
                <div className="bg-success/80 w-1/5 h-5"></div>
                <div className="bg-success w-1/5 h-6 rounded-r-full"></div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border/40 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Arbitrage Opportunities</h3>
                <p className="text-sm text-muted-foreground">
                  Found {filteredData.length} opportunities across South African bookmakers
                </p>
              </div>
              <div className="flex items-center gap-2">
                <SearchFilters onFilterChange={handleFilterChange} />
              </div>
            </div>
            {isLoading && opportunities.length === 0 ? (
              <div className="p-8">
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : (
              <ArbitrageTable arbitrageData={filteredData} />
            )}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
