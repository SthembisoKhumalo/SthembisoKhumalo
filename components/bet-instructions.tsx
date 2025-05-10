"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, ExternalLink, Info, Calculator, DollarSign } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import type { ArbitrageOpportunity } from "@/lib/arbitrage-service"
import type { LinkedBookmaker } from "@/components/bookmaker-manager"

interface BetInstructionsProps {
  arbitrage: ArbitrageOpportunity
  linkedBookmakers?: Array<LinkedBookmaker>
}

export default function BetInstructions({ arbitrage, linkedBookmakers = [] }: BetInstructionsProps) {
  const [totalStake, setTotalStake] = useState(1000)
  const [localLinkedBookmakers, setLocalLinkedBookmakers] = useState<LinkedBookmaker[]>([])

  // Load bookmakers from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedBookmakers = localStorage.getItem("linkedBookmakers")
        if (savedBookmakers) {
          setLocalLinkedBookmakers(JSON.parse(savedBookmakers))
        }
      } catch (e) {
        console.error("Error loading saved bookmakers:", e)
      }
    }
  }, [])

  // Calculate optimal stake distribution for arbitrage
  const calculateArbitrageStakes = () => {
    // Calculate the implied probabilities from the odds
    const impliedProbabilities = arbitrage.odds.map((odd) => 1 / odd)

    // Calculate the sum of implied probabilities
    const sumOfProbabilities = impliedProbabilities.reduce((sum, prob) => sum + prob, 0)

    // Calculate the arbitrage percentage
    const arbitragePercentage = sumOfProbabilities

    // Calculate the profit percentage
    const profitPercentage = (1 / arbitragePercentage - 1) * 100

    // Calculate the target return (same for all outcomes)
    const targetReturn = totalStake * (1 + profitPercentage / 100)

    // Calculate the stakes for each outcome to achieve the same return
    const stakes = arbitrage.odds.map((odd) => targetReturn / odd)

    // Calculate the actual total stake
    const actualTotalStake = stakes.reduce((sum, stake) => sum + stake, 0)

    // Return the stakes, returns, and profit
    return {
      stakes: stakes.map((stake) => Math.round(stake * 100) / 100),
      returns: Array(stakes.length).fill(Math.round(targetReturn * 100) / 100),
      profit: Math.round((targetReturn - actualTotalStake) * 100) / 100,
      totalStake: Math.round(actualTotalStake * 100) / 100,
    }
  }

  const arbitrageResult = calculateArbitrageStakes()
  const guaranteedProfit = arbitrageResult.profit
  const profitPercentage = Math.round((guaranteedProfit / arbitrageResult.totalStake) * 10000) / 100

  // Check if bookmaker is linked
  const isBookmakerLinked = (bookmakerName: string) => {
    if (!localLinkedBookmakers || !bookmakerName) return false

    return localLinkedBookmakers.some(
      (b) =>
        b.name && bookmakerName && b.name.toLowerCase() === bookmakerName.toLowerCase() && b.active && b.isLoggedIn,
    )
  }

  // Get bookmaker details if linked
  const getBookmakerDetails = (bookmakerName: string) => {
    if (!localLinkedBookmakers || !bookmakerName) return undefined

    return localLinkedBookmakers.find(
      (b) => b.name && bookmakerName && b.name.toLowerCase() === bookmakerName.toLowerCase() && b.active,
    )
  }

  const openBookmaker = (bookmaker: string, index: number) => {
    // First try to use the URL from the arbitrage data
    if (arbitrage.urls && arbitrage.urls[index]) {
      window.open(arbitrage.urls[index], "_blank")
      toast({
        title: "Opening Bookmaker",
        description: `Opening ${bookmaker} in a new tab`,
      })
      return
    }

    // Fall back to linked bookmaker URL
    const bookmakerInfo = localLinkedBookmakers.find((b) => b.name === bookmaker)
    if (bookmakerInfo?.url) {
      window.open(bookmakerInfo.url, "_blank")
      toast({
        title: "Opening Bookmaker",
        description: `Opening ${bookmaker} in a new tab`,
      })
    } else {
      toast({
        title: "Bookmaker not linked",
        description: "Please link this bookmaker in your account settings first",
      })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 rounded-full">
          <Calculator className="mr-2 h-4 w-4" />
          Instructions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-background border-border">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Detailed Bet Instructions</DialogTitle>
          <DialogDescription>Follow these steps to place your arbitrage bets for {arbitrage.event}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto pr-1">
          {/* Stake Calculator */}
          <Card className="border-border bg-muted/10 card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <DollarSign className="mr-2 h-5 w-5" />
                Stake Calculator
              </CardTitle>
              <CardDescription>Adjust your total investment to calculate optimal stake distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Total Investment (R)</label>
                  <Input
                    type="number"
                    value={totalStake}
                    onChange={(e) => setTotalStake(Number(e.target.value))}
                    min={10}
                    step={10}
                    className="bg-muted/50 border-border"
                  />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium mb-1">Guaranteed Profit</div>
                  <div className="text-2xl font-bold text-success">R{guaranteedProfit}</div>
                  <div className="text-sm text-muted-foreground">({profitPercentage}% ROI)</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="w-[120px] text-muted-foreground">Bookmaker</TableHead>
                      <TableHead className="w-[100px] text-muted-foreground">Bet On</TableHead>
                      <TableHead className="w-[80px] text-muted-foreground">Odds</TableHead>
                      <TableHead className="w-[100px] text-muted-foreground">Stake</TableHead>
                      <TableHead className="w-[100px] text-muted-foreground">Return</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arbitrage.outcomes.map((outcome, index) => (
                      <TableRow key={index} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {arbitrage.bookmakers[index]}
                            {isBookmakerLinked(arbitrage.bookmakers[index]) && (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium bg-muted/30">
                            {outcome} - {arbitrage.teams ? arbitrage.teams[index] : ""}
                          </Badge>
                        </TableCell>
                        <TableCell>{arbitrage.odds[index]}</TableCell>
                        <TableCell className="text-primary">R{arbitrageResult.stakes[index]}</TableCell>
                        <TableCell className="text-success">R{arbitrageResult.returns[index]}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-border">
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total Stake:
                      </TableCell>
                      <TableCell className="font-medium text-primary">R{arbitrageResult.totalStake}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Bet Summary Card */}
          <Card className="border-border bg-muted/10 card-gradient">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Bet Summary</CardTitle>
              <CardDescription>Your arbitrage betting plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {arbitrage.outcomes.map((outcome, index) => (
                <div key={index} className="rounded-lg border border-border p-4 bg-background/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{arbitrage.bookmakers[index]}</div>
                        <div className="text-sm text-muted-foreground">
                          Bet on {outcome} - {arbitrage.teams ? arbitrage.teams[index] : ""}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm bg-muted/30">
                      Odds: {arbitrage.odds[index]}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Stake Amount</div>
                      <div className="text-lg font-semibold text-primary">R{arbitrageResult.stakes[index]}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Potential Return</div>
                      <div className="text-lg font-semibold text-success">R{arbitrageResult.returns[index]}</div>
                    </div>
                  </div>

                  {isBookmakerLinked(arbitrage.bookmakers[index]) && (
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm text-muted-foreground">Account connected</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/50 text-primary hover:bg-primary/10"
                        onClick={() => openBookmaker(arbitrage.bookmakers[index], index)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Place Bet
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <div className="rounded-lg border border-border p-4 bg-background/50">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Total Stake</div>
                    <div className="text-sm text-muted-foreground">Combined investment</div>
                  </div>
                  <div className="text-xl font-bold text-primary">R{arbitrageResult.totalStake}</div>
                </div>
                <div className="mt-2 pt-2 border-t border-border flex justify-between items-center">
                  <div>
                    <div className="font-medium text-success">Guaranteed Profit</div>
                    <div className="text-sm text-muted-foreground">No matter the outcome</div>
                  </div>
                  <div className="text-xl font-bold text-success">R{guaranteedProfit}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step by Step Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Step-by-Step Instructions</h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-center font-medium text-primary">
                  1
                </div>
                <div className="space-y-1">
                  <p className="font-medium leading-none">Prepare your accounts</p>
                  <p className="text-sm text-muted-foreground">
                    Ensure you have active accounts with sufficient funds at {arbitrage.bookmakers.join(" and ")}.
                  </p>
                </div>
              </div>

              {arbitrage.outcomes.map((outcome, index) => {
                const bookmakerDetails = getBookmakerDetails(arbitrage.bookmakers[index])

                return (
                  <div className="flex gap-3" key={index}>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-center font-medium text-primary">
                      {index + 2}
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="font-medium leading-none">Place your {index === 0 ? "first" : "second"} bet</p>
                      <p className="text-sm text-muted-foreground">
                        Go to <span className="font-medium">{arbitrage.bookmakers[index]}</span> and bet{" "}
                        <span className="font-medium text-primary">R{arbitrageResult.stakes[index]}</span> on{" "}
                        <span className="font-medium">
                          {outcome} ({arbitrage.teams ? arbitrage.teams[index] : ""})
                        </span>{" "}
                        at odds of <span className="font-medium">{arbitrage.odds[index]}</span>.
                      </p>

                      {bookmakerDetails ? (
                        <div className="mt-2 p-3 rounded-lg border border-border bg-muted/10">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-10 w-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: bookmakerDetails.color + "20" }}
                            >
                              <img
                                src={bookmakerDetails.logo || "/placeholder.svg"}
                                alt={bookmakerDetails.name}
                                className="h-6 w-6 object-contain"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{bookmakerDetails.name}</span>
                                <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                                  Connected
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Logged in as @{bookmakerDetails.username} • Balance: {bookmakerDetails.balance}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-primary/50 text-primary hover:bg-primary/10"
                              onClick={() => openBookmaker(arbitrage.bookmakers[index], index)}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Open
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 border-primary/50 text-primary hover:bg-primary/10"
                          onClick={() => openBookmaker(arbitrage.bookmakers[index], index)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Go to {arbitrage.bookmakers[index]}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}

              <div className="flex gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-center font-medium text-primary">
                  {arbitrage.outcomes.length + 2}
                </div>
                <div className="space-y-1">
                  <p className="font-medium leading-none">Verify your bets</p>
                  <p className="text-sm text-muted-foreground">
                    Double-check all bet slips to ensure correct stakes, odds, and selections before confirming.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips and Warnings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Important Tips</h3>

            <Alert variant="warning" className="bg-amber-950/20 border-amber-800/30 text-amber-300">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Act quickly</AlertTitle>
              <AlertDescription className="text-amber-200/80">
                Odds can change rapidly. Place your bets as quickly as possible to secure the arbitrage opportunity.
              </AlertDescription>
            </Alert>

            <Alert className="bg-muted/20 border-border">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">Avoid detection</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Bookmakers may limit accounts they suspect of arbitrage betting. Consider rounding stakes to avoid exact
                calculated amounts.
              </AlertDescription>
            </Alert>

            <Alert variant="default" className="bg-success/5 border-success/30">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertTitle className="text-success">Confirm all details</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Verify event details, bet types, and any special conditions that might affect your bets.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
