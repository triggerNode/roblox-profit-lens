import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Settings = () => {
  const [devExRate, setDevExRate] = useState("0.0035");
  const [marketplaceCut, setMarketplaceCut] = useState("0.30");

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>DevEx Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="devex-rate">DevEx Rate (USD per Robux)</Label>
                <Input
                  id="devex-rate"
                  type="number"
                  step="0.0001"
                  value={devExRate}
                  onChange={(e) => setDevExRate(e.target.value)}
                  placeholder="0.0035"
                />
                <p className="text-sm text-muted-foreground">
                  Current official rate: $0.0035 per Robux
                </p>
              </div>
              <Button>Save DevEx Rate</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marketplace Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="marketplace-cut">Roblox Marketplace Cut</Label>
                <Input
                  id="marketplace-cut"
                  type="number"
                  step="0.01"
                  value={marketplaceCut}
                  onChange={(e) => setMarketplaceCut(e.target.value)}
                  placeholder="0.30"
                />
                <p className="text-sm text-muted-foreground">
                  Percentage taken by Roblox (default: 30%)
                </p>
              </div>
              <Button>Save Marketplace Cut</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                disabled
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Change Password</Button>
              <Button variant="outline">Export Data</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;