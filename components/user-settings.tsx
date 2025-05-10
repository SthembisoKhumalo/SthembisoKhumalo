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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { User, Shield, CreditCard, LogOut } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function UserSettings() {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    notifications: {
      newOpportunities: true,
      profitAlerts: true,
      bookmakerUpdates: false,
      marketingEmails: false,
    },
    defaultStake: "1000",
    minProfitAlert: "2.5",
  })

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
      variant: "success",
    })
  }

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
      variant: "success",
    })
  }

  const handleSaveBetting = () => {
    toast({
      title: "Betting Settings Updated",
      description: "Your betting preferences have been saved.",
      variant: "success",
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <User className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
          <DialogDescription>Manage your account settings and preferences</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="betting">Betting Preferences</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4 pr-1">
            <TabsContent value="profile" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value="********" disabled />
                    <Button variant="outline" size="sm" className="w-fit">
                      Change Password
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile}>Save Profile</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Configure how and when you receive notifications about arbitrage opportunities and account updates.
                </p>

                <div className="space-y-4 border rounded-lg p-4 border-border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">New Opportunities</label>
                      <p className="text-xs text-muted-foreground">
                        Get notified when new arbitrage opportunities are found
                      </p>
                    </div>
                    <Switch
                      checked={user.notifications.newOpportunities}
                      onCheckedChange={(checked) =>
                        setUser({
                          ...user,
                          notifications: { ...user.notifications, newOpportunities: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Profit Alerts</label>
                      <p className="text-xs text-muted-foreground">
                        Get notified when high-profit opportunities are available
                      </p>
                    </div>
                    <Switch
                      checked={user.notifications.profitAlerts}
                      onCheckedChange={(checked) =>
                        setUser({
                          ...user,
                          notifications: { ...user.notifications, profitAlerts: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Bookmaker Updates</label>
                      <p className="text-xs text-muted-foreground">
                        Get notified about changes to your linked bookmaker accounts
                      </p>
                    </div>
                    <Switch
                      checked={user.notifications.bookmakerUpdates}
                      onCheckedChange={(checked) =>
                        setUser({
                          ...user,
                          notifications: { ...user.notifications, bookmakerUpdates: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Marketing Emails</label>
                      <p className="text-xs text-muted-foreground">Receive updates about new features and promotions</p>
                    </div>
                    <Switch
                      checked={user.notifications.marketingEmails}
                      onCheckedChange={(checked) =>
                        setUser({
                          ...user,
                          notifications: { ...user.notifications, marketingEmails: checked },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="betting" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Betting Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Configure your default betting settings and preferences.
                </p>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="defaultStake">Default Stake Amount (R)</Label>
                    <Input
                      id="defaultStake"
                      type="number"
                      value={user.defaultStake}
                      onChange={(e) => setUser({ ...user, defaultStake: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be the default investment amount for new arbitrage calculations
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="minProfit">Minimum Profit Alert (%)</Label>
                    <Input
                      id="minProfit"
                      type="number"
                      value={user.minProfitAlert}
                      onChange={(e) => setUser({ ...user, minProfitAlert: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      You'll be alerted when opportunities exceed this profit percentage
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveBetting}>Save Betting Preferences</Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-between pt-4 border-t border-border">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </Button>
          </div>
          <Button variant="destructive" size="sm" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
