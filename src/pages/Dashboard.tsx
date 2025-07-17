import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, TrendingUp, Calculator, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalGrossRobux: number;
  totalNetRobux: number;
  totalNetUSD: number;
  devexRate: number;
  totalItems: number;
  totalAdSpend: number;
  roi: number;
}

interface TopItem {
  item_name: string;
  total_usd: number;
  total_robux: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalGrossRobux: 0,
    totalNetRobux: 0,
    totalNetUSD: 0,
    devexRate: 0.0035,
    totalItems: 0,
    totalAdSpend: 0,
    roi: 0,
  });
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
        return;
      }

      // Fetch user profile for DevEx rate
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('devex_rate')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      if (transactions && transactions.length > 0) {
        setHasData(true);
        
        // Calculate stats
        const totalGrossRobux = transactions.reduce((sum, t) => sum + t.gross_robux, 0);
        const totalNetRobux = transactions.reduce((sum, t) => sum + t.net_robux, 0);
        const totalNetUSD = transactions.reduce((sum, t) => sum + t.net_usd, 0);
        const totalAdSpend = transactions.reduce((sum, t) => sum + (t.ad_spend || 0), 0);
        const roi = totalAdSpend > 0 ? ((totalNetUSD - totalAdSpend) / totalAdSpend) * 100 : 0;

        setStats({
          totalGrossRobux,
          totalNetRobux,
          totalNetUSD,
          devexRate: profile?.devex_rate || 0.0035,
          totalItems: transactions.length,
          totalAdSpend,
          roi,
        });

        // Calculate top items
        const itemGroups = transactions.reduce((acc, t) => {
          if (!acc[t.item_name]) {
            acc[t.item_name] = { total_usd: 0, total_robux: 0 };
          }
          acc[t.item_name].total_usd += t.net_usd;
          acc[t.item_name].total_robux += t.gross_robux;
          return acc;
        }, {} as Record<string, { total_usd: number; total_robux: number }>);

        const topItemsData = Object.entries(itemGroups)
          .map(([item_name, data]) => ({
            item_name,
            total_usd: data.total_usd,
            total_robux: data.total_robux,
          }))
          .sort((a, b) => b.total_usd - a.total_usd)
          .slice(0, 5);

        setTopItems(topItemsData);
      } else {
        setHasData(false);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!hasData) {
    return (
      <AppLayout>
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Data Yet</h2>
              <p className="text-muted-foreground mb-6">
                Upload your first Roblox CSV file to see your profit dashboard
              </p>
              <Button onClick={handleUploadClick}>
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV File
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline">All Time</Badge>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">True Net USD Profit</p>
              <p className="text-2xl font-bold text-profit-positive">
                ${stats.totalNetUSD.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gross Robux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalGrossRobux.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Before marketplace cut</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Robux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalNetRobux.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">After marketplace cut</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DevEx Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.devexRate.toFixed(4)}</div>
              <p className="text-xs text-muted-foreground">Per Robux</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total sales</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Ad ROI Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Ad Spend</span>
                  <span className="text-lg font-bold">${stats.totalAdSpend.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Net Revenue</span>
                  <span className="text-lg font-bold text-profit-positive">${stats.totalNetUSD.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm font-medium">ROI</span>
                  <span className={`text-lg font-bold ${stats.roi >= 0 ? 'text-profit-positive' : 'text-destructive'}`}>
                    {stats.roi.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performing Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topItems.length > 0 ? (
                  topItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium truncate">{item.item_name}</span>
                      <span className="text-profit-positive">${item.total_usd.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No items found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;