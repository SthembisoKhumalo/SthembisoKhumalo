"use client"

import { useState } from "react"
import { Search, Filter, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SearchFiltersProps {
  onFilterChange?: (filters: any) => void
}

export default function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [minProfit, setMinProfit] = useState(2)
  const [filters, setFilters] = useState({
    sport: "all",
    bookmaker: "all",
    minProfit: 2,
    timeFrame: "24h",
    twoWayOnly: true,
  })

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  const handleMinProfitChange = (value: number[]) => {
    setMinProfit(value[0])
    handleFilterChange("minProfit", value[0])
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Filter className="h-4 w-4" />
          Filters
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Filter Opportunities</h4>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search events or teams..." className="pl-8" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sport</label>
            <Select
              defaultValue="all"
              value={filters.sport}
              onValueChange={(value) => handleFilterChange("sport", value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="rugby">Rugby</SelectItem>
                <SelectItem value="cricket">Cricket</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
                <SelectItem value="basketball">Basketball</SelectItem>
                <SelectItem value="horse-racing">Horse Racing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bookmakers</label>
            <Select
              defaultValue="all"
              value={filters.bookmaker}
              onValueChange={(value) => handleFilterChange("bookmaker", value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select bookmakers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bookmakers</SelectItem>
                <SelectItem value="hollywoodbets">Hollywoodbets</SelectItem>
                <SelectItem value="betway">Betway</SelectItem>
                <SelectItem value="sportingbet">Sportingbet</SelectItem>
                <SelectItem value="supabets">Supabets</SelectItem>
                <SelectItem value="wsb">World Sports Betting</SelectItem>
                <SelectItem value="sunbet">Sunbet</SelectItem>
                <SelectItem value="gbets">Gbets</SelectItem>
                <SelectItem value="playabets">Playabets</SelectItem>
                <SelectItem value="betfred">Betfred</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Min. Profit (%)</label>
              <span className="text-sm font-medium">{minProfit}%</span>
            </div>
            <Slider defaultValue={[2]} max={10} step={0.1} value={[minProfit]} onValueChange={handleMinProfitChange} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Time Frame</label>
            <Select
              defaultValue="24h"
              value={filters.timeFrame}
              onValueChange={(value) => handleFilterChange("timeFrame", value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select time frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6h">Next 6 hours</SelectItem>
                <SelectItem value="12h">Next 12 hours</SelectItem>
                <SelectItem value="24h">Next 24 hours</SelectItem>
                <SelectItem value="48h">Next 48 hours</SelectItem>
                <SelectItem value="7d">Next 7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Event Type</label>
            <div className="flex items-center space-x-2 mt-1">
              <Checkbox
                id="two-way"
                checked={filters.twoWayOnly}
                onCheckedChange={(checked) => handleFilterChange("twoWayOnly", checked === true)}
              />
              <label
                htmlFor="two-way"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                2-way markets only (Win/Lose)
              </label>
            </div>
          </div>

          <Button className="w-full">Apply Filters</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
