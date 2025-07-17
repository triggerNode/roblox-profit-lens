import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, TrendingUp, Calculator, FileText, BarChart3, ArrowUp, ArrowDown, Play } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { WaterfallChart } from "@/components/WaterfallChart";

interface MonthlyMetrics {
  month: string;
  total_transactions: number;
  gross_robux: number;
  roblox_cut_robux: number;
  ad_spend_robux: number;
  net_robux: number;
  net_usd: number;
  avg_devex_rate: number;
}

interface TopItem {
  item_name: string;
  total_usd: number;
  total_robux: number;
  ad_spend: number;
  roi: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<MonthlyMetrics[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch monthly metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: false });

      if (metricsError) {
        console.error('Error fetching metrics:', metricsError);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
        return;
      }

      // Fetch detailed transactions for top items
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        toast({
          title: "Error",
          description: "Failed to load transaction data",
          variant: "destructive",
        });
        return;
      }

      if (metricsData && metricsData.length > 0) {
        setHasData(true);
        setMetrics(metricsData.map(m => ({
          ...m,
          month: new Date(m.month).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          })
        })));

        // Calculate top items with ROI
        if (transactions && transactions.length > 0) {
          const itemGroups = transactions.reduce((acc, t) => {
            if (!acc[t.item_name]) {
              acc[t.item_name] = { 
                total_usd: 0, 
                total_robux: 0, 
                ad_spend: 0 
              };
            }
            acc[t.item_name].total_usd += t.net_usd;
            acc[t.item_name].total_robux += t.gross_robux;
            acc[t.item_name].ad_spend += t.ad_spend || 0;
            return acc;
          }, {} as Record<string, { total_usd: number; total_robux: number; ad_spend: number }>);

          const topItemsData = Object.entries(itemGroups)
            .map(([item_name, data]) => ({
              item_name,
              total_usd: data.total_usd,
              total_robux: data.total_robux,
              ad_spend: data.ad_spend,
              roi: data.ad_spend > 0 ? ((data.total_usd - data.ad_spend) / data.ad_spend) * 100 : 0
            }))
            .sort((a, b) => b.total_usd - a.total_usd)
            .slice(0, 10);

          setTopItems(topItemsData);
        }
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

  const handleDemoData = useCallback(async () => {
    setIsLoadingDemo(true);

    try {
      const { data, error } = await supabase.functions.invoke('seed_demo');

      if (error) {
        console.error('Error creating demo data:', error);
        toast({
          title: "Demo Failed",
          description: "Failed to create demo data. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.success) {
        toast({
          title: "Demo Data Created",
          description: `Created ${data.transactionCount} sample transactions. Data expires in 24 hours.`,
        });
        // Refresh dashboard data
        await fetchDashboardData();
      } else {
        toast({
          title: "Demo Failed",
          description: "Failed to create demo data. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error calling demo function:', error);
      toast({
        title: "Demo Failed",
        description: "An error occurred while creating demo data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDemo(false);
    }
  }, [toast, fetchDashboardData]);

  const getSelectedMetrics = () => {
    if (selectedMonth === "all") {
      return metrics.reduce((acc, m) => ({
        total_transactions: acc.total_transactions + m.total_transactions,
        gross_robux: acc.gross_robux + m.gross_robux,
        roblox_cut_robux: acc.roblox_cut_robux + m.roblox_cut_robux,
        ad_spend_robux: acc.ad_spend_robux + m.ad_spend_robux,
        net_robux: acc.net_robux + m.net_robux,
        net_usd: acc.net_usd + m.net_usd,
        avg_devex_rate: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.avg_devex_rate, 0) / metrics.length : 0
      }), {
        total_transactions: 0,
        gross_robux: 0,
        roblox_cut_robux: 0,
        ad_spend_robux: 0,
        net_robux: 0,
        net_usd: 0,
        avg_devex_rate: 0
      });
    }
    
    const monthMetrics = metrics.find(m => m.month === selectedMonth);
    return monthMetrics || {
      total_transactions: 0,
      gross_robux: 0,
      roblox_cut_robux: 0,
      ad_spend_robux: 0,
      net_robux: 0,
      net_usd: 0,
      avg_devex_rate: 0
    };
  };

  const getPreviousMonthMetrics = () => {
    if (selectedMonth === "all" || metrics.length < 2) return null;
    
    const currentIndex = metrics.findIndex(m => m.month === selectedMonth);
    if (currentIndex === -1 || currentIndex === metrics.length - 1) return null;
    
    return metrics[currentIndex + 1];
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
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
              <div className="flex gap-3">
                <Button onClick={handleUploadClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV File
                </Button>
                <Button variant="outline" onClick={handleDemoData} disabled={isLoadingDemo}>
                  <Play className="h-4 w-4 mr-2" />
                  {isLoadingDemo ? "Loading..." : "Try Demo Data"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentMetrics = getSelectedMetrics();
  const previousMetrics = getPreviousMonthMetrics();
  const roi = currentMetrics.ad_spend_robux > 0 ? 
    ((currentMetrics.net_usd - currentMetrics.ad_spend_robux) / currentMetrics.ad_spend_robux) * 100 : 0;

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                {metrics.map((metric) => (
                  <SelectItem key={metric.month} value={metric.month}>
                    {metric.month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">True Net USD Profit</p>
              <p className="text-2xl font-bold text-profit-positive">
                ${currentMetrics.net_usd.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gross Robux</CardTitle>
              {previousMetrics && (
                <div className="flex items-center text-xs">
                  {calculateTrend(currentMetrics.gross_robux, previousMetrics.gross_robux) > 0 ? (
                    <ArrowUp className="h-3 w-3 text-profit-positive" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className={calculateTrend(currentMetrics.gross_robux, previousMetrics.gross_robux) > 0 ? 'text-profit-positive' : 'text-destructive'}>
                    {Math.abs(calculateTrend(currentMetrics.gross_robux, previousMetrics.gross_robux)).toFixed(1)}%
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {currentMetrics.gross_robux.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Before marketplace cut</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Robux</CardTitle>
              {previousMetrics && (
                <div className="flex items-center text-xs">
                  {calculateTrend(currentMetrics.net_robux, previousMetrics.net_robux) > 0 ? (
                    <ArrowUp className="h-3 w-3 text-profit-positive" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className={calculateTrend(currentMetrics.net_robux, previousMetrics.net_robux) > 0 ? 'text-profit-positive' : 'text-destructive'}>
                    {Math.abs(calculateTrend(currentMetrics.net_robux, previousMetrics.net_robux)).toFixed(1)}%
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {currentMetrics.net_robux.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">After marketplace cut & ads</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DevEx Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${currentMetrics.avg_devex_rate.toFixed(4)}</div>
              <p className="text-xs text-muted-foreground">Per Robux</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              {previousMetrics && (
                <div className="flex items-center text-xs">
                  {calculateTrend(currentMetrics.total_transactions, previousMetrics.total_transactions) > 0 ? (
                    <ArrowUp className="h-3 w-3 text-profit-positive" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className={calculateTrend(currentMetrics.total_transactions, previousMetrics.total_transactions) > 0 ? 'text-profit-positive' : 'text-destructive'}>
                    {Math.abs(calculateTrend(currentMetrics.total_transactions, previousMetrics.total_transactions)).toFixed(1)}%
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.total_transactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total sales</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Profit Waterfall
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WaterfallChart
                grossRobux={currentMetrics.gross_robux}
                robloxCut={currentMetrics.roblox_cut_robux}
                adSpend={currentMetrics.ad_spend_robux}
                netRobux={currentMetrics.net_robux}
                devexRate={currentMetrics.avg_devex_rate}
                netUSD={currentMetrics.net_usd}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Ad ROI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Ad Spend</span>
                  <span className="text-lg font-bold">${currentMetrics.ad_spend_robux.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Net Revenue</span>
                  <span className="text-lg font-bold text-profit-positive">${currentMetrics.net_usd.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Roblox Cut</span>
                  <span className="text-lg font-bold text-destructive">-${currentMetrics.roblox_cut_robux.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm font-medium">ROI</span>
                  <span className={`text-lg font-bold ${roi >= 0 ? 'text-profit-positive' : 'text-destructive'}`}>
                    {roi.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                <div className="grid gap-4">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                    <div className="col-span-4">Item Name</div>
                    <div className="col-span-2 text-right">Net USD</div>
                    <div className="col-span-2 text-right">Gross Robux</div>
                    <div className="col-span-2 text-right">Ad Spend</div>
                    <div className="col-span-2 text-right">ROI</div>
                  </div>
                  {topItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 text-sm">
                      <div className="col-span-4 font-medium truncate">{item.item_name}</div>
                      <div className="col-span-2 text-right text-profit-positive">${item.total_usd.toFixed(2)}</div>
                      <div className="col-span-2 text-right">R$ {item.total_robux.toLocaleString()}</div>
                      <div className="col-span-2 text-right">${item.ad_spend.toFixed(2)}</div>
                      <div className={`col-span-2 text-right ${item.roi >= 0 ? 'text-profit-positive' : 'text-destructive'}`}>
                        {item.roi.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No items found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;