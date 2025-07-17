import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Subscription {
  id: string;
  product_id: string;
  status: string;
  current_period_end: string;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  plan_name: string;
  trial_days_remaining: number;
}

interface PlanFeatures {
  max_games?: string | number;
  retention_days?: number;
  auto_sync?: string;
  seats?: number;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  planFeatures: PlanFeatures | null;
  hasActiveSubscription: boolean;
  loading: boolean;
  trialDaysRemaining: number;
  checkSubscription: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider = ({ children }: SubscriptionProviderProps) => {
  const authContext = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [planFeatures, setPlanFeatures] = useState<PlanFeatures | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);

  // Handle case where AuthProvider is still loading
  if (!authContext) {
    return (
      <SubscriptionContext.Provider
        value={{
          subscription: null,
          planFeatures: null,
          hasActiveSubscription: false,
          loading: true,
          trialDaysRemaining: 0,
          checkSubscription: async () => {},
          openCustomerPortal: async () => { throw new Error('Auth not ready'); },
        }}
      >
        {children}
      </SubscriptionContext.Provider>
    );
  }

  const { user, session } = authContext;

  const checkSubscription = async () => {
    if (!user || !session) {
      setSubscription(null);
      setPlanFeatures(null);
      setHasActiveSubscription(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSubscription(data.subscription);
      setPlanFeatures(data.planFeatures);
      setHasActiveSubscription(data.hasActiveSubscription);
      setTrialDaysRemaining(data.subscription?.trial_days_remaining || 0);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription(null);
      setPlanFeatures(null);
      setHasActiveSubscription(false);
      setTrialDaysRemaining(0);
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!session) {
      throw new Error('No active session');
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user, session]);

  // Refresh subscription status every 30 seconds
  useEffect(() => {
    if (user && session) {
      const interval = setInterval(checkSubscription, 30000);
      return () => clearInterval(interval);
    }
  }, [user, session]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        planFeatures,
        hasActiveSubscription,
        loading,
        trialDaysRemaining,
        checkSubscription,
        openCustomerPortal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};