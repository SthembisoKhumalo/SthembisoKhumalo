"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Calculator } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Sample sports data
const sportsOptions = [
  { value: "football", label: "Football" },
  { value: "rugby", label: "Rugby" },
  { value: "cricket", label: "Cricket" },
  { value: "tennis", label: "Tennis" },
  { value: "basketball", label: "Basketball" },
]

// Sample bookmakers data - in a real app this would come from user state
const bookmakerOptions = [
  { value: "hollywoodbets", label: "Hollywoodbets" },
  { value: "betway", label: "Betway" },
  { value: "sportingbet", label: "Sportingbet" },
  { value: "supabets", label: "Supabets" },
  { value: "wsb", label: "World Sports Betting" },
  { value: "sunbet", label: "Sunbet" },
  { value: "gbets", label: "Gbets" },
  { value: "playabets", label: "Playabets" },
  { value: "betfred", label: "Betfred" },
]

export default function AddOpportunityForm({ onAddOpportunity }: { onAddOpportunity: (data: any) => void }) {
  const [formData, setFormData] = useState({
    event: "",
    sport: "",
    time: "",
    outcomes: [
      { bookmaker: "", outcome: "", odds: "", team: "" },
      { bookmaker: "", outcome: "", odds: "", team: "" },
    ],
    stake: 1000,
  })

  const [calculatedProfit, setCalculatedProfit] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleOutcomeChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newOutcomes = [...prev.outcomes]
      newOutcomes[index] = { ...newOutcomes[index], [field]: value }
      return { ...prev, outcomes: newOutcomes }
    })
  }

  const calculateProfit = () => {
    setIsCalculating(true)

    // Convert odds to numbers
    const odds = formData.outcomes.map((o) => Number.parseFloat(o.odds))

    // Check if we have valid odds
    if (odds.some((odd) => isNaN(odd) || odd <= 1)) {
      setCalculatedProfit(null)
      setIsCalculating(false)
      return
    }

    // Calculate implied probabilities
    const impliedProbabilities = odds.map((odd) => 1 / odd)

    // Calculate sum of implied probabilities
    const sumOfProbabilities = impliedProbabilities.reduce((sum, prob) => sum + prob, 0)

    // Check if this is an arbitrage opportunity (sum < 1)
    if (sumOfProbabilities >= 1) {
      setCalculatedProfit(null)
      setIsCalculating(false)
      return
    }

    // Calculate profit percentage
    const profitPercentage = (1 / sumOfProbabilities - 1) * 100

    setCalculatedProfit(Math.round(profitPercentage * 100) / 100)
    setIsCalculating(false)
  }

  const handleSubmit = () => {
    if (!calculatedProfit) {
      calculateProfit()
      return
    }

    // Create the opportunity object
    const opportunity = {
      id: Date.now(),
      event: formData.event,
      sport: formData.sport,
      time: formData.time,
      profit: calculatedProfit,
      bookmakers: formData.outcomes.map((o) => o.bookmaker),
      odds: formData.outcomes.map((o) => Number.parseFloat(o.odds)),
      outcomes: formData.outcomes.map((o) => o.outcome),
      teams: formData.outcomes.map((o) => o.team),
      stake: `R${formData.stake}`,
      return: `R${Math.round(formData.stake * (1 + calculatedProfit / 100))}`,
    }

    onAddOpportunity(opportunity)
  }

  const isFormValid = () => {
    return (
      formData.event.trim() !== "" &&
      formData.sport.trim() !== "" &&
      formData.time.trim() !== "" &&
      formData.outcomes.every(
        (o) =>
          o.bookmaker.trim() !== "" && o.outcome.trim() !== "" && Number.parseFloat(o.odds) > 1 && o.team.trim() !== "",
      )
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Opportunity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Arbitrage Opportunity</DialogTitle>
          <DialogDescription>Manually add an arbitrage opportunity you've found across bookmakers</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 pr-1">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event">Event Name</Label>
                <Input
                  id="event"
                  placeholder="e.g. Kaizer Chiefs vs Orlando Pirates"
                  value={formData.event}
                  onChange={(e) => handleChange("event", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sport">Sport</Label>
                <Select value={formData.sport} onValueChange={(value) => handleChange("sport", value)}>
                  <SelectTrigger id="sport">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportsOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Event Time</Label>
                <Input
                  id="time"
                  placeholder="e.g. Today, 20:00"
                  value={formData.time}
                  onChange={(e) => handleChange("time", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stake">Investment Amount (R)</Label>
                <Input
                  id="stake"
                  type="number"
                  min={100}
                  step={100}
                  value={formData.stake}
                  onChange={(e) => handleChange("stake", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Betting Outcomes</h3>
                {calculatedProfit !== null && (
                  <Badge className="bg-primary text-primary-foreground">{calculatedProfit}% Profit Potential</Badge>
                )}
              </div>

              {formData.outcomes.map((outcome, index) => (
                <Card key={index} className="border-border bg-muted/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Outcome {index + 1}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`bookmaker-${index}`}>Bookmaker</Label>
                        <Select
                          value={outcome.bookmaker}
                          onValueChange={(value) => handleOutcomeChange(index, "bookmaker", value)}
                        >
                          <SelectTrigger id={`bookmaker-${index}`}>
                            <SelectValue placeholder="Select bookmaker" />
                          </SelectTrigger>
                          <SelectContent>
                            {bookmakerOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`team-${index}`}>Team to Bet On</Label>
                        <Input
                          id={`team-${index}`}
                          placeholder="e.g. Kaizer Chiefs"
                          value={outcome.team}
                          onChange={(e) => handleOutcomeChange(index, "team", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`outcome-${index}`}>Outcome Type</Label>
                        <Select
                          value={outcome.outcome}
                          onValueChange={(value) => handleOutcomeChange(index, "outcome", value)}
                        >
                          <SelectTrigger id={`outcome-${index}`}>
                            <SelectValue placeholder="Select outcome" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Home">Home Win</SelectItem>
                            <SelectItem value="Away">Away Win</SelectItem>
                            <SelectItem value="Draw">Draw</SelectItem>
                            <SelectItem value="Player 1">Player 1 Win</SelectItem>
                            <SelectItem value="Player 2">Player 2 Win</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`odds-${index}`}>Odds</Label>
                        <Input
                          id={`odds-${index}`}
                          placeholder="e.g. 2.5"
                          value={outcome.odds}
                          onChange={(e) => handleOutcomeChange(index, "odds", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={calculateProfit}
            disabled={!isFormValid() || isCalculating}
            className="gap-2"
          >
            <Calculator className="h-4 w-4" />
            {isCalculating ? "Calculating..." : "Calculate Profit"}
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid() || calculatedProfit === null}>
            {calculatedProfit === null ? "Calculate First" : "Add Opportunity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
