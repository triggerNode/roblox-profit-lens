import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrialBanner } from "@/components/TrialBanner";
import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfit = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('net_usd')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user profit:', error);
        } else {
          const total = data?.reduce((sum, transaction) => sum + (transaction.net_usd || 0), 0) || 0;
          setTotalProfit(total);
        }
      } catch (error) {
        console.error('Error calculating total profit:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfit();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="ml-4" />
            <div className="flex-1" />
            <div className="flex items-center gap-4 mr-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">True Net USD Profit</p>
                <p className="text-xl font-bold text-profit-positive">
                  {loading ? "Loading..." : `$${totalProfit.toFixed(2)}`}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    {user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <TrialBanner />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};