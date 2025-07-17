import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline">This Month</Badge>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">True Net USD Profit</p>
              <p className="text-2xl font-bold text-profit-positive">$2,847.53</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gross Robux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 845,230</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Robux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 591,661</div>
              <p className="text-xs text-muted-foreground">After marketplace cut</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DevEx Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.0035</div>
              <p className="text-xs text-muted-foreground">Per Robux</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,429</div>
              <p className="text-xs text-muted-foreground">+8.2% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Waterfall</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Waterfall chart coming soon...
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Premium Sword Pack</span>
                  <span className="text-profit-positive">$847.32</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">VIP Gamepass</span>
                  <span className="text-profit-positive">$623.15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Speed Boost</span>
                  <span className="text-profit-positive">$412.89</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;