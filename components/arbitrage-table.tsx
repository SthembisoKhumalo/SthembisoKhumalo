"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ExternalLink, Star, Clock, TrendingUp } from "lucide-react"
import BetInstructions from "./bet-instructions"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import type { ArbitrageOpportunity } from "@/lib/arbitrage-service"

// Sample linked bookmakers data - in a real app this would come from user state
const linkedBookmakers = [
  {
    id: "hollywoodbets",
    name: "Hollywoodbets",
    username: "user123",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#8C1F66",
    balance: "R1,250.00",
    active: true,
    url: "https://www.hollywoodbets.co.za",
  },
  {
    id: "betway",
    name: "Betway",
    username: "bettor456",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#000000",
    balance: "R780.50",
    active: true,
    url: "https://www.betway.co.za",
  },
  {
    id: "sportingbet",
    name: "Sportingbet",
    username: "arbitrage789",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#0088CE",
    balance: "R500.00",
    active: true,
    url: "https://www.sportingbet.co.za",
  },
  {
    id: "supabets",
    name: "Supabets",
    username: "winner123",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#E30613",
    balance: "R950.00",
    active: true,
    url: "https://www.supabets.co.za",
  },
]

interface ArbitrageTableProps {
  arbitrageData: ArbitrageOpportunity[]
}

export default function ArbitrageTable({ arbitrageData }: ArbitrageTableProps) {
  const [sortBy, setSortBy] = useState("profit")
  const [sortOrder, setSortOrder] = useState("desc")
  const [favorites, setFavorites] = useState<number[]>([])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((fav) => fav !== id))
      toast({
        title: "Removed from favorites",
        description: "Opportunity removed from your favorites list",
      })
    } else {
      setFavorites([...favorites, id])
      toast({
        title: "Added to favorites",
        description: "Opportunity added to your favorites list",
      })
    }
  }

  const openBookmaker = (bookmaker: string, url?: string) => {
    if (url) {
      window.open(url, "_blank")
      return
    }

    const bookmakerInfo = linkedBookmakers.find((b) => b.name === bookmaker)
    if (bookmakerInfo?.url) {
      window.open(bookmakerInfo.url, "_blank")
    } else {
      toast({
        title: "Bookmaker not linked",
        description: "Please link this bookmaker in your account settings first",
      })
    }
  }

  // Sort data based on current sort settings
  const sortedData = [...arbitrageData].sort((a, b) => {
    if (sortBy === "profit") {
      return sortOrder === "asc" ? a.profit - b.profit : b.profit - a.profit
    }
    // Add more sorting options as needed
    return 0
  })

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-background">
            <TableHead className="text-muted-foreground">Event</TableHead>
            <TableHead className="text-muted-foreground">Time</TableHead>
            <TableHead className="cursor-pointer text-muted-foreground" onClick={() => handleSort("profit")}>
              <div className="flex items-center">
                Profit %
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-muted-foreground">Bookmakers & Bets</TableHead>
            <TableHead className="text-muted-foreground">Potential Return</TableHead>
            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((item) => (
              <TableRow key={item.id} className="border-border hover:bg-muted/10">
                <TableCell>
                  <div>
                    <div className="font-medium">{item.event}</div>
                    <div className="text-sm text-muted-foreground">{item.sport}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span>{item.time}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-primary flex items-center">
                    {item.profit}%
                    <TrendingUp className="ml-1 h-4 w-4" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    {item.bookmakers.map((bookmaker, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5">
                          <span>{bookmaker}</span>
                          <Badge variant="outline" className="text-xs bg-muted/30">
                            {item.outcomes[index]} - {item.teams ? item.teams[index] : ""}
                          </Badge>
                        </div>
                        <span className="font-medium">{item.odds[index]}</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-success">{item.return}</div>
                  <div className="text-sm text-muted-foreground">on {item.stake}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-8 w-8 rounded-full ${favorites.includes(item.id) ? "bg-primary/20 text-primary" : ""}`}
                      onClick={() => toggleFavorite(item.id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <BetInstructions arbitrage={item} linkedBookmakers={linkedBookmakers || []} />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => openBookmaker(item.bookmakers[0], item.urls?.[0])}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" />
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">No opportunities found</p>
                  <p className="text-sm">Try adjusting your search or wait for new opportunities</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
