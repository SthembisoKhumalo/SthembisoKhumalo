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
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  CheckCircle2,
  LinkIcon,
  Plus,
  Settings,
  Trash2,
  Wallet,
  Copy,
  RefreshCw,
  AlertTriangle,
  LogIn,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Available South African bookmakers
const availableBookmakers = [
  {
    id: "hollywoodbets",
    name: "Hollywoodbets",
    logo: "https://www.hollywoodbets.net/favicon.ico",
    color: "#8C1F66",
    popular: true,
    url: "https://www.hollywoodbets.co.za",
    loginUrl: "https://www.hollywoodbets.co.za/login",
  },
  {
    id: "betway",
    name: "Betway",
    logo: "https://www.betway.co.za/favicon.ico",
    color: "#000000",
    popular: true,
    url: "https://www.betway.co.za",
    loginUrl: "https://www.betway.co.za/myaccount/summary",
  },
  {
    id: "sportingbet",
    name: "Sportingbet",
    logo: "https://www.sportingbet.co.za/favicon.ico",
    color: "#0088CE",
    popular: true,
    url: "https://www.sportingbet.co.za",
    loginUrl: "https://www.sportingbet.co.za/myaccount",
  },
  {
    id: "supabets",
    name: "Supabets",
    logo: "https://www.supabets.co.za/favicon.ico",
    color: "#E30613",
    popular: true,
    url: "https://www.supabets.co.za",
    loginUrl: "https://www.supabets.co.za/myaccount",
  },
  {
    id: "wsb",
    name: "World Sports Betting",
    logo: "https://www.worldsportsbetting.co.za/favicon.ico",
    color: "#00A651",
    popular: true,
    url: "https://www.wsb.co.za",
    loginUrl: "https://www.wsb.co.za/account",
  },
  {
    id: "sunbet",
    name: "Sunbet",
    logo: "https://www.sunbet.co.za/favicon.ico",
    color: "#FDB913",
    popular: false,
    url: "https://www.sunbet.co.za",
    loginUrl: "https://www.sunbet.co.za/account",
  },
  {
    id: "gbets",
    name: "Gbets",
    logo: "https://www.gbets.co.za/favicon.ico",
    color: "#7AC143",
    popular: false,
    url: "https://www.gbets.co.za",
    loginUrl: "https://www.gbets.co.za/my-account",
  },
  {
    id: "playabets",
    name: "Playabets",
    logo: "https://www.playabets.co.za/favicon.ico",
    color: "#FF6600",
    popular: false,
    url: "https://www.playabets.co.za",
    loginUrl: "https://www.playabets.co.za/account",
  },
  {
    id: "betfred",
    name: "Betfred",
    logo: "https://www.betfred.co.za/favicon.ico",
    color: "#0066B3",
    popular: false,
    url: "https://www.betfred.co.za",
    loginUrl: "https://www.betfred.co.za/account",
  },
]

export interface LinkedBookmaker {
  id: string
  name: string
  username: string
  password: string
  logo: string
  color: string
  balance: string
  active: boolean
  url: string
  lastUpdated?: string
  lastSyncAttempt?: string
  syncStatus?: "success" | "error" | "pending" | "none"
  syncError?: string
  notes?: string
  isLoggedIn?: boolean
}

export default function BookmakerManager() {
  const [linkedBookmakers, setLinkedBookmakers] = useState<LinkedBookmaker[]>([])
  const [isRefreshingBalances, setIsRefreshingBalances] = useState(false)
  const [refreshingBookmaker, setRefreshingBookmaker] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("linked")

  const [newBookmaker, setNewBookmaker] = useState({
    id: "",
    username: "",
    password: "",
    notes: "",
  })

  const [editMode, setEditMode] = useState<string | null>(null)
  const [editData, setEditData] = useState({
    notes: "",
  })

  // Load bookmakers from localStorage on component mount
  useEffect(() => {
    loadBookmakers()
  }, [])

  // Load bookmakers from localStorage
  const loadBookmakers = () => {
    const savedBookmakers = localStorage.getItem("linkedBookmakers")
    if (savedBookmakers) {
      try {
        setLinkedBookmakers(JSON.parse(savedBookmakers))
      } catch (e) {
        console.error("Error loading saved bookmakers:", e)
      }
    }
  }

  // Function to refresh balances from the server using real accounts
  const refreshBalances = async (bookmakerIds?: string[]) => {
    setIsRefreshingBalances(true)

    try {
      // Update bookmakers to show pending status
      const updatedBookmakers = linkedBookmakers.map((bookmaker) => {
        if (!bookmakerIds || bookmakerIds.includes(bookmaker.id)) {
          return {
            ...bookmaker,
            syncStatus: "pending" as const,
            lastSyncAttempt: new Date().toISOString(),
          }
        }
        return bookmaker
      })

      setLinkedBookmakers(updatedBookmakers)
      localStorage.setItem("linkedBookmakers", JSON.stringify(updatedBookmakers))

      // Call the API to refresh balances with real accounts
      const response = await fetch("/api/refresh-balances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookmakers: updatedBookmakers
            .filter((b) => !bookmakerIds || bookmakerIds.includes(b.id))
            .map((b) => ({
              id: b.id,
              username: b.username,
              password: b.password,
            })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to refresh balances")
      }

      const data = await response.json()

      // Update bookmakers with real balances
      const refreshedBookmakers = linkedBookmakers.map((bookmaker) => {
        const refreshedData = data.results?.find((result: any) => result.id === bookmaker.id)

        if (refreshedData) {
          return {
            ...bookmaker,
            balance: refreshedData.balance || bookmaker.balance,
            syncStatus: refreshedData.success ? "success" : "error",
            syncError: refreshedData.error || undefined,
            lastUpdated: refreshedData.success ? new Date().toISOString() : bookmaker.lastUpdated,
            isLoggedIn: refreshedData.success ? true : bookmaker.isLoggedIn,
          }
        }
        return bookmaker
      })

      setLinkedBookmakers(refreshedBookmakers)
      localStorage.setItem("linkedBookmakers", JSON.stringify(refreshedBookmakers))

      toast({
        title: "Balances Updated",
        description: "Your bookmaker balances have been refreshed.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error refreshing balances:", error)
      toast({
        title: "Error Refreshing Balances",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })

      // Update bookmakers to show error status
      const errorBookmakers = linkedBookmakers.map((bookmaker) => {
        if (!bookmakerIds || bookmakerIds.includes(bookmaker.id)) {
          return {
            ...bookmaker,
            syncStatus: "error" as const,
            syncError: "Failed to refresh balance",
          }
        }
        return bookmaker
      })

      setLinkedBookmakers(errorBookmakers)
      localStorage.setItem("linkedBookmakers", JSON.stringify(errorBookmakers))
    } finally {
      setIsRefreshingBalances(false)
      setRefreshingBookmaker(null)
    }
  }

  // Refresh a single bookmaker balance
  const refreshSingleBalance = async (id: string) => {
    setRefreshingBookmaker(id)

    // Update the bookmaker status to pending
    const updatedBookmakers = linkedBookmakers.map((b) =>
      b.id === id ? { ...b, syncStatus: "pending" as const, lastSyncAttempt: new Date().toISOString() } : b,
    )
    setLinkedBookmakers(updatedBookmakers)
    localStorage.setItem("linkedBookmakers", JSON.stringify(updatedBookmakers))

    try {
      // Get the bookmaker credentials
      const bookmaker = linkedBookmakers.find((b) => b.id === id)
      if (!bookmaker) {
        throw new Error("Bookmaker not found")
      }

      // Show toast that we're refreshing
      toast({
        title: "Refreshing Balance",
        description: `Attempting to refresh ${bookmaker.name} balance...`,
      })

      // Call the API to refresh the balance
      const response = await fetch("/api/refresh-balances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookmakers: [
            {
              id: bookmaker.id,
              username: bookmaker.username,
              password: bookmaker.password,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to refresh balance")
      }

      const data = await response.json()
      const refreshedData = data.results?.find((result: any) => result.id === id)

      if (!refreshedData || !refreshedData.success) {
        throw new Error(refreshedData?.error || "Failed to refresh balance")
      }

      // Update the bookmaker with the real balance
      const refreshedBookmakers = linkedBookmakers.map((b) =>
        b.id === id
          ? {
              ...b,
              balance: refreshedData.balance,
              syncStatus: "success" as const,
              lastUpdated: new Date().toISOString(),
              isLoggedIn: true,
            }
          : b,
      )

      setLinkedBookmakers(refreshedBookmakers)
      localStorage.setItem("linkedBookmakers", JSON.stringify(refreshedBookmakers))

      toast({
        title: "Balance Updated",
        description: `${bookmaker.name} balance has been refreshed.`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error refreshing balance:", error)

      // Get a more user-friendly error message
      let errorMessage = error instanceof Error ? error.message : "Failed to refresh balance"

      // Make the error message more user-friendly
      if (errorMessage.includes("timeout")) {
        errorMessage = "Connection timed out. The bookmaker website may be slow or unavailable."
      } else if (errorMessage.includes("username field")) {
        errorMessage = "Could not find the login form. The bookmaker website may have changed."
      } else if (errorMessage.includes("navigation")) {
        errorMessage = "Could not navigate to the bookmaker website. Please check your internet connection."
      }

      // Update the bookmaker to show error status
      const errorBookmakers = linkedBookmakers.map((b) =>
        b.id === id
          ? {
              ...b,
              syncStatus: "error" as const,
              syncError: errorMessage,
            }
          : b,
      )

      setLinkedBookmakers(errorBookmakers)
      localStorage.setItem("linkedBookmakers", JSON.stringify(errorBookmakers))

      toast({
        title: "Error Refreshing Balance",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setRefreshingBookmaker(null)
    }
  }

  // Add a new bookmaker account
  const handleAddBookmaker = () => {
    const bookmakerInfo = availableBookmakers.find((b) => b.id === newBookmaker.id)
    if (bookmakerInfo) {
      const newLinkedBookmaker: LinkedBookmaker = {
        id: bookmakerInfo.id,
        name: bookmakerInfo.name,
        username: newBookmaker.username,
        password: newBookmaker.password,
        logo: bookmakerInfo.logo,
        color: bookmakerInfo.color,
        balance: "Not fetched",
        active: true,
        url: bookmakerInfo.url,
        syncStatus: "none",
        notes: newBookmaker.notes || "",
        isLoggedIn: false,
      }

      const updatedBookmakers = [...linkedBookmakers, newLinkedBookmaker]
      setLinkedBookmakers(updatedBookmakers)

      // Save to localStorage for persistence
      localStorage.setItem("linkedBookmakers", JSON.stringify(updatedBookmakers))

      setNewBookmaker({
        id: "",
        username: "",
        password: "",
        notes: "",
      })

      // Switch back to the linked tab after adding
      setActiveTab("linked")

      toast({
        title: "Bookmaker Added",
        description: `${bookmakerInfo.name} has been added to your accounts.`,
      })
    }
  }

  const handleRemoveBookmaker = (id: string) => {
    const bookmaker = linkedBookmakers.find((b) => b.id === id)
    const updatedBookmakers = linkedBookmakers.filter((b) => b.id !== id)

    setLinkedBookmakers(updatedBookmakers)

    // Update localStorage
    localStorage.setItem("linkedBookmakers", JSON.stringify(updatedBookmakers))

    if (bookmaker) {
      toast({
        title: "Bookmaker Removed",
        description: `${bookmaker.name} has been removed from your accounts.`,
      })
    }
  }

  const handleToggleActive = (id: string) => {
    const updatedBookmakers = linkedBookmakers.map((b) => (b.id === id ? { ...b, active: !b.active } : b))

    setLinkedBookmakers(updatedBookmakers)

    // Update localStorage
    localStorage.setItem("linkedBookmakers", JSON.stringify(updatedBookmakers))
  }

  const handleEditBookmaker = (id: string) => {
    const bookmaker = linkedBookmakers.find((b) => b.id === id)
    if (bookmaker) {
      setEditMode(id)
      setEditData({
        notes: bookmaker.notes || "",
      })
    }
  }

  const handleSaveEdit = (id: string) => {
    const updatedBookmakers = linkedBookmakers.map((b) => (b.id === id ? { ...b, notes: editData.notes } : b))

    setLinkedBookmakers(updatedBookmakers)
    setEditMode(null)

    // Update localStorage
    localStorage.setItem("linkedBookmakers", JSON.stringify(updatedBookmakers))

    toast({
      title: "Bookmaker Updated",
      description: "Your bookmaker details have been updated.",
    })
  }

  const handleCopyUsername = (username: string) => {
    navigator.clipboard.writeText(username)
    toast({
      title: "Username Copied",
      description: "Username has been copied to clipboard.",
    })
  }

  // Direct login to bookmaker website
  const directLogin = (bookmaker: LinkedBookmaker) => {
    // Find the bookmaker info
    const bookmakerInfo = availableBookmakers.find((b) => b.id === bookmaker.id)
    if (!bookmakerInfo) {
      toast({
        title: "Error",
        description: "Bookmaker information not found",
        variant: "destructive",
      })
      return
    }

    // Open the login URL in a new tab
    window.open(bookmakerInfo.loginUrl, "_blank")

    toast({
      title: "Opening Bookmaker",
      description: `Opening ${bookmaker.name} in a new tab. Please log in manually.`,
    })
  }

  const unlinkedBookmakers = availableBookmakers.filter((b) => !linkedBookmakers.some((lb) => lb.id === b.id))

  // Format the last updated time
  const formatLastUpdated = (timestamp?: string) => {
    if (!timestamp) return "Never"

    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Get sync status badge
  const getSyncStatusBadge = (bookmaker: LinkedBookmaker) => {
    if (bookmaker.isLoggedIn) {
      return (
        <Badge variant="outline" className="text-xs font-normal bg-green-950/20 text-green-400 border-green-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
          Logged In
        </Badge>
      )
    }

    switch (bookmaker.syncStatus) {
      case "success":
        return (
          <Badge variant="outline" className="text-xs font-normal bg-green-950/20 text-green-400 border-green-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
            Synced
          </Badge>
        )
      case "error":
        return (
          <Badge variant="outline" className="text-xs font-normal bg-red-950/20 text-red-400 border-red-500/30">
            <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
            Error
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="text-xs font-normal bg-amber-950/20 text-amber-400 border-amber-500/30">
            <RefreshCw className="h-3 w-3 mr-1 text-amber-500 animate-spin" />
            Syncing
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 mt-4 w-full"
          onClick={() => {
            setIsDialogOpen(true)
            // Reload bookmakers when dialog opens
            loadBookmakers()
          }}
        >
          <Wallet className="h-4 w-4" />
          Manage Bookmaker Accounts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Linked Bookmaker Accounts</DialogTitle>
          <DialogDescription>
            Connect your South African bookmaker accounts to enable real-time data scraping
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="linked">My Accounts</TabsTrigger>
            <TabsTrigger value="add">Add New Account</TabsTrigger>
          </TabsList>

          <TabsContent value="linked" className="space-y-4 py-4 flex-1 overflow-y-auto">
            {linkedBookmakers.length > 0 && (
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Your connected bookmaker accounts</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshBalances()}
                  disabled={isRefreshingBalances}
                  className="gap-2"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingBalances ? "animate-spin" : ""}`} />
                  {isRefreshingBalances ? "Refreshing..." : "Refresh All Balances"}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {linkedBookmakers.map((bookmaker) => (
                <Card key={bookmaker.id} className="overflow-hidden border-border bg-muted/10">
                  <div className="h-2" style={{ backgroundColor: bookmaker.color }} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                          <img
                            src={bookmaker.logo || "/placeholder.svg?height=40&width=40"}
                            alt={bookmaker.name}
                            className="h-6 w-6 object-contain"
                            onError={(e) => {
                              // If the image fails to load, use a fallback
                              e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                            }}
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
                      <div className="flex items-center gap-1">
                        <span>@{bookmaker.username}</span>
                        <button
                          onClick={() => handleCopyUsername(bookmaker.username)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      {bookmaker.active && getSyncStatusBadge(bookmaker)}
                    </CardDescription>
                  </CardHeader>

                  {editMode === bookmaker.id ? (
                    <CardContent className="pb-2 space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor={`notes-${bookmaker.id}`}>Notes</Label>
                        <Input
                          id={`notes-${bookmaker.id}`}
                          value={editData.notes}
                          onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                          placeholder="Add notes about this account"
                        />
                      </div>
                    </CardContent>
                  ) : (
                    <CardContent className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">Balance</div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{bookmaker.balance}</div>
                          <button
                            onClick={() => refreshSingleBalance(bookmaker.id)}
                            disabled={refreshingBookmaker === bookmaker.id}
                            className="text-muted-foreground hover:text-primary"
                          >
                            <RefreshCw
                              className={`h-3.5 w-3.5 ${refreshingBookmaker === bookmaker.id ? "animate-spin" : ""}`}
                            />
                          </button>
                        </div>
                      </div>

                      {bookmaker.lastUpdated && (
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-xs text-muted-foreground">Last updated</div>
                          <div className="text-xs text-muted-foreground">
                            {formatLastUpdated(bookmaker.lastUpdated)}
                          </div>
                        </div>
                      )}

                      {bookmaker.syncError && (
                        <Alert variant="destructive" className="mt-2 py-2 px-3">
                          <AlertDescription className="text-xs">{bookmaker.syncError}</AlertDescription>
                        </Alert>
                      )}

                      {bookmaker.notes && <div className="mt-2 text-xs text-muted-foreground">{bookmaker.notes}</div>}
                    </CardContent>
                  )}

                  <CardFooter className="flex justify-between pt-2">
                    {editMode === bookmaker.id ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setEditMode(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => handleSaveEdit(bookmaker.id)}>
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveBookmaker(bookmaker.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditBookmaker(bookmaker.id)}>
                            <Settings className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => directLogin(bookmaker)}
                            className="border-primary/50 text-primary hover:bg-primary/10"
                          >
                            <LogIn className="h-4 w-4 mr-1" />
                            Login
                          </Button>
                        </div>
                      </>
                    )}
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
                <TabsList className="mt-2">
                  <TabsTrigger value="add" className="w-full" onClick={() => setActiveTab("add")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Bookmaker
                  </TabsTrigger>
                </TabsList>
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
                        src={bookmaker.logo || "/placeholder.svg?height=40&width=40"}
                        alt={bookmaker.name}
                        className="h-8 w-8 object-contain"
                        onError={(e) => {
                          // If the image fails to load, use a fallback
                          e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                        }}
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
              <div className="space-y-4 border-t border-border pt-4">
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
                      Your credentials will be used to access real-time odds data. They are stored locally on your
                      device.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Input
                      id="notes"
                      placeholder="Add notes about this account"
                      value={newBookmaker.notes}
                      onChange={(e) => setNewBookmaker({ ...newBookmaker, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setNewBookmaker({ id: "", username: "", password: "", notes: "" })}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddBookmaker}
                    disabled={!newBookmaker.id || !newBookmaker.username || !newBookmaker.password}
                    className="gap-2"
                  >
                    <LinkIcon className="h-4 w-4" />
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
