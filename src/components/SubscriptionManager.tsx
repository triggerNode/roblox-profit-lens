import { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, CreditCard, Settings as SettingsIcon } from 'lucide-react';

export const SubscriptionManager = () => {
  const { subscription, planFeatures, hasActiveSubscription, openCustomerPortal } = useSubscription();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open billing portal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!hasActiveSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            No Active Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You don't have an active subscription. Subscribe to access all features.
          </p>
          <Button asChild>
            <a href="/pricing">View Plans</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Current Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{subscription?.plan_name}</h3>
            <p className="text-sm text-muted-foreground">
              {subscription?.product_id} plan
            </p>
          </div>
          <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
            {subscription?.status}
          </Badge>
        </div>

        {subscription?.current_period_end && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>
              {subscription.cancel_at_period_end 
                ? `Expires on ${formatDate(subscription.current_period_end)}`
                : `Renews on ${formatDate(subscription.current_period_end)}`
              }
            </span>
          </div>
        )}

        {subscription?.trial_end && new Date(subscription.trial_end) > new Date() && (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm font-medium text-blue-900">
              Free trial ends on {formatDate(subscription.trial_end)}
            </p>
          </div>
        )}

        {planFeatures && (
          <div className="space-y-2">
            <h4 className="font-medium">Plan Features</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {planFeatures.max_games && (
                <div>
                  <span className="text-muted-foreground">Games: </span>
                  <span className="font-medium">
                    {planFeatures.max_games === 'unlimited' ? 'Unlimited' : planFeatures.max_games}
                  </span>
                </div>
              )}
              {planFeatures.retention_days && (
                <div>
                  <span className="text-muted-foreground">Retention: </span>
                  <span className="font-medium">{planFeatures.retention_days} days</span>
                </div>
              )}
              {planFeatures.auto_sync && (
                <div>
                  <span className="text-muted-foreground">Auto-sync: </span>
                  <span className="font-medium">{planFeatures.auto_sync}</span>
                </div>
              )}
              {planFeatures.seats && (
                <div>
                  <span className="text-muted-foreground">Seats: </span>
                  <span className="font-medium">{planFeatures.seats}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Button 
          onClick={handleManageBilling}
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          <SettingsIcon className="h-4 w-4 mr-2" />
          {loading ? 'Loading...' : 'Manage Billing'}
        </Button>
      </CardContent>
    </Card>
  );
};