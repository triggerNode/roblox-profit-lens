import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresSubscription?: boolean;
}

export const ProtectedRoute = ({ children, requiresSubscription = false }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasActiveSubscription, loading: subscriptionLoading, planFeatures, subscription } = useSubscription();
  const location = useLocation();

  // Enforce feature limits based on plan
  useEffect(() => {
    if (user && hasActiveSubscription && planFeatures) {
      // Here you could implement feature gating logic
      // For example, limiting uploads based on plan features
      console.log('Plan features:', planFeatures);
    }
  }, [user, hasActiveSubscription, planFeatures]);

  if (authLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only require subscription for specific protected routes
  const protectedRoutes = ['/dashboard', '/settings', '/support'];
  const isProtectedRoute = protectedRoutes.includes(location.pathname);
  
  if (requiresSubscription && !hasActiveSubscription && isProtectedRoute) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};