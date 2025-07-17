import { useSubscription } from '@/contexts/SubscriptionContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TrialBanner = () => {
  const { subscription, trialDaysRemaining, hasActiveSubscription } = useSubscription();
  const navigate = useNavigate();

  // Only show if user has a trial subscription
  if (!subscription || subscription.status !== 'trialing' || !trialDaysRemaining) {
    return null;
  }

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mx-4 my-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Free Trial
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining
            </span>
          </div>
        </div>
        
        <Button 
          size="sm" 
          onClick={handleUpgrade}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Upgrade Now
        </Button>
      </div>
      
      {trialDaysRemaining <= 3 && (
        <div className="mt-2 text-sm text-orange-600 dark:text-orange-400">
          ⚠️ Your trial expires soon. Upgrade to continue using all features.
        </div>
      )}
    </div>
  );
};