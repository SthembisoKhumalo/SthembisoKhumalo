"use client"

import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, ExternalLink, LinkIcon, Plus, Settings, Trash2, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

// Sample bookmaker data
const availableBookmakers = [
  {
    id: "hollywoodbets",
    name: "Hollywoodbets",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#8C1F66",
    popular: true,
  },
  {
    id: "betway",
    name: "Betway",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#000000",
    popular: true,
  },
  {
    id: "sportingbet",
    name: "Sportingbet",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#0088CE",
    popular: true,
  },
  {
    id: "supabets",
    name: "Supabets",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#E30613",
    popular: true,
  },
  {
    id: "wsb",
    name: "World Sports Betting",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#00A651",
    popular: true,
  },
  {
    id: "sunbet",
    name: "Sunbet",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#FDB913",
    popular: false,
  },
  {
    id: "gbets",
    name: "Gbets",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#7AC143",
    popular: false,
  },
  {
    id: "playabets",
    name: "Playabets",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#FF6600",
    popular: false,
  },
  {
    id: "betfred",
    name: "Betfred",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#0066B3",
    popular: false,
  },
]

export default function LinkedBookmakers() {
  // In a real app, this would be fetched from a database
  const [linkedBookmakers, setLinkedBookmakers] = useState([
    {
      id: "hollywoodbets",
      name: "Hollywoodbets",
      username: "user123",
      logo: "/placeholder.svg?height=40&width=40",
      color: "#8C1F66",
      balance: "R1,250.00",
      active: true,
    },
    {
      id: "betway",
      name: "Betway",
      username: "bettor456",
      logo: "/placeholder.svg?height=40&width=40",
      color: "#000000",
      balance: "R780.50",
      active: true,
    },
    {
      id: "sportingbet",
      name: "Sportingbet",
      username: "arbitrage789",
      logo: "/placeholder.svg?height=40&width=40",
      color: "#0088CE",
      balance: "R500.00",
      active: true,
    },
    {
      id: "supabets",
      name: "Supabets",
      username: "winner123",
      logo: "/placeholder.svg?height=40&width=40",
      color: "#E30613",
      balance: "R950.00",
      active: true,
    },
  ])

  const [newBookmaker, setNewBookmaker] = useState({
    id: "",
    username: "",
    password: "",
  })

  const handleAddBookmaker = () => {
    const bookmakerInfo = availableBookmakers.find((b) => b.id === newBookmaker.id)
    if (bookmakerInfo) {
      setLinkedBookmakers([
        ...linkedBookmakers,
        {
          id: bookmakerInfo.id,
          name: bookmakerInfo.name,
          username: newBookmaker.username,
          logo: bookmakerInfo.logo,
          color: bookmakerInfo.color,
          balance: "R0.00",
          active: true,
        },
      ])

      setNewBookmaker({
        id: "",
        username: "",
        password: "",
      })
    }
  }

  const handleRemoveBookmaker = (id: string) => {
    setLinkedBookmakers(linkedBookmakers.filter((b) => b.id !== id))
  }

  const handleToggleActive = (id: string) => {
    setLinkedBookmakers(linkedBookmakers.map((b) => (b.id === id ? { ...b, active: !b.active } : b)))
  }

  const unlinkedBookmakers = availableBookmakers.filter((b) => !linkedBookmakers.some((lb) => lb.id === b.id))

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wallet className="h-4 w-4" />
          My Bookmakers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Linked Bookmaker Accounts</DialogTitle>
          <DialogDescription>
            Manage your South African bookmaker accounts to streamline your arbitrage betting experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="linked" className="w-full flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="linked">My Accounts</TabsTrigger>
            <TabsTrigger value="add">Add New Account</TabsTrigger>
          </TabsList>

          <TabsContent value="linked" className="space-y-4 py-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {linkedBookmakers.map((bookmaker) => (
                <Card key={bookmaker.id} className="overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: bookmaker.color }} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                          <img
                            src={bookmaker.logo || "/placeholder.svg"}
                            alt={bookmaker.name}
                            className="h-6 w-6 object-contain"
                          />
                        </div>
                        <CardTitle className="text-base">{bookmaker.name}</CardTitle>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center">
                              <Switch
                                checked={bookmaker.active}
                                onCheckedChange={() => handleToggleActive(bookmaker.id)}
                                size="sm"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{bookmaker.active ? "Active" : "Inactive"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <span>@{bookmaker.username}</span>
                      {bookmaker.active && (
                        <Badge variant="outline" className="text-xs font-normal">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                          Connected
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Balance</div>
                      <div className="font-medium">{bookmaker.balance}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveBookmaker(bookmaker.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Visit
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {linkedBookmakers.length === 0 && (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Wallet className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No bookmakers linked</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Add your bookmaker accounts to get started with arbitrage betting
                </p>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Bookmaker
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-6 py-4 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Select a Bookmaker</h3>
              <p className="text-sm text-muted-foreground">Choose from popular South African bookmakers</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                {unlinkedBookmakers.map((bookmaker) => (
                  <div
                    key={bookmaker.id}
                    className={`
                      flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${
                        newBookmaker.id === bookmaker.id
                          ? `border-primary bg-primary/5`
                          : `border-transparent hover:border-muted-foreground/20 hover:bg-muted/50`
                      }
                    `}
                    onClick={() => setNewBookmaker({ ...newBookmaker, id: bookmaker.id })}
                  >
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                      <img
                        src={bookmaker.logo || "/placeholder.svg"}
                        alt={bookmaker.name}
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                    <span className="text-sm font-medium text-center">{bookmaker.name}</span>
                    {bookmaker.popular && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {newBookmaker.id && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium">
                  Connect your {availableBookmakers.find((b) => b.id === newBookmaker.id)?.name} account
                </h3>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Your bookmaker username"
                      value={newBookmaker.username}
                      onChange={(e) => setNewBookmaker({ ...newBookmaker, username: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Your bookmaker password"
                      value={newBookmaker.password}
                      onChange={(e) => setNewBookmaker({ ...newBookmaker, password: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your credentials are securely stored and only used to access your account information.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewBookmaker({ id: "", username: "", password: "" })}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddBookmaker}
                    disabled={!newBookmaker.id || !newBookmaker.username || !newBookmaker.password}
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Connect Account
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
