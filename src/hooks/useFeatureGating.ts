import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';

export const useFeatureGating = () => {
  const { hasActiveSubscription, planFeatures, subscription } = useSubscription();
  const { user } = useAuth();

  const canUpload = () => {
    if (!user) return false;
    if (!hasActiveSubscription) return false;
    return true;
  };

  const getMaxGames = (): number | string => {
    if (!hasActiveSubscription || !planFeatures) return 0;
    return planFeatures.max_games === 'unlimited' ? 'unlimited' : (planFeatures.max_games || 1);
  };

  const getRetentionDays = (): number => {
    if (!hasActiveSubscription || !planFeatures) return 30;
    return planFeatures.retention_days || 30;
  };

  const hasAutoSync = (): boolean => {
    if (!hasActiveSubscription || !planFeatures) return false;
    return planFeatures.auto_sync === 'enabled' || planFeatures.auto_sync === 'daily' || planFeatures.auto_sync === 'realtime';
  };

  const getTeamSeats = (): number => {
    if (!hasActiveSubscription || !planFeatures) return 1;
    return planFeatures.seats || 1;
  };

  const isTrialing = (): boolean => {
    return subscription?.status === 'trialing';
  };

  const getTrialDaysRemaining = (): number => {
    return subscription?.trial_days_remaining || 0;
  };

  return {
    canUpload,
    getMaxGames,
    getRetentionDays,
    hasAutoSync,
    getTeamSeats,
    isTrialing,
    getTrialDaysRemaining,
    hasActiveSubscription,
    planFeatures,
  };
};