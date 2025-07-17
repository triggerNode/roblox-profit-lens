import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  trial_period_days: number;
  features: PlanFeature[];
  metadata: any;
  popular?: boolean;
  available?: boolean;
}

export const Pricing = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [seatData, setSeatData] = useState<any>(null);

  useEffect(() => {
    fetchPlans();
    fetchSeatData();
    
    // Refresh seat data every 30 seconds
    const interval = setInterval(fetchSeatData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPlans = async () => {
    try {
      const { data: products, error } = await supabase
        .from('subscription_products')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (error) throw error;

      // Check early bird inventory
      const { data: usage } = await supabase
        .from('subscription_usage')
        .select('checkouts_count')
        .eq('product_id', 'early_bird')
        .single();

      const formattedPlans: Plan[] = products.map(product => ({
        id: product.product_id,
        name: product.name,
        price: product.price,
        trial_period_days: product.trial_period_days,
        metadata: product.metadata,
        available: product.product_id === 'early_bird' ? 
          (seatData?.early_bird?.available ?? true) : true,
        popular: product.product_id === 'growth',
        features: generateFeatures((product.metadata as Record<string, any>) || {})
      }));

      setPlans(formattedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to load pricing plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSeatData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('seat-counter');
      if (error) throw error;
      setSeatData(data);
    } catch (error) {
      console.error('Error fetching seat data:', error);
    }
  };

  const generateFeatures = (metadata: Record<string, any>): PlanFeature[] => {
    const features: PlanFeature[] = [];
    
    if (metadata.max_games) {
      features.push({
        name: metadata.max_games === 'unlimited' ? 'Unlimited Games' : `${metadata.max_games} Game${metadata.max_games > 1 ? 's' : ''}`,
        included: true
      });
    }
    
    if (metadata.retention_days) {
      features.push({
        name: `${metadata.retention_days} Days Data Retention`,
        included: true
      });
    }
    
    if (metadata.auto_sync) {
      features.push({
        name: `${metadata.auto_sync} Auto-Sync`,
        included: true
      });
    }
    
    if (metadata.seats) {
      features.push({
        name: `${metadata.seats} Team Seats`,
        included: true
      });
    }

    return features;
  };

  const handleCheckout = async (planId: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to subscribe",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { product_id: planId },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">
          Select the perfect plan for your Roblox analytics needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
            )}
            
            {!plan.available && (
              <div className="absolute -top-3 right-4">
                <Badge variant="destructive">Sold Out</Badge>
              </div>
            )}

            {plan.id === 'early_bird' && seatData?.early_bird && (
              <div className="absolute -top-3 left-4">
                <Badge variant="secondary">
                  {seatData.early_bird.remaining} / {seatData.early_bird.max} left
                </Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                ${(plan.price / 100).toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              {plan.trial_period_days > 0 && (
                <p className="text-sm text-muted-foreground">
                  {plan.trial_period_days} day free trial
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {feature.included ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{feature.name}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full" 
                onClick={() => handleCheckout(plan.id)}
                disabled={!plan.available}
                variant={plan.popular ? "default" : "outline"}
              >
                {!plan.available ? 'Sold Out' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-muted-foreground">
          All plans include secure data handling and 24/7 support
        </p>
      </div>
    </div>
  );
};