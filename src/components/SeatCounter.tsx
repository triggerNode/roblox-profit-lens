import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Users, Clock } from 'lucide-react';

interface SeatCounterProps {
  className?: string;
}

export const SeatCounter = ({ className = "" }: SeatCounterProps) => {
  const [seatData, setSeatData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeatData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSeatData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSeatData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('seat-counter');
      if (error) throw error;
      setSeatData(data);
    } catch (error) {
      console.error('Error fetching seat data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !seatData?.early_bird) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-muted rounded w-32"></div>
      </div>
    );
  }

  const { current, max, remaining, available } = seatData.early_bird;

  if (!available) {
    return (
      <Badge variant="destructive" className={className}>
        <Users className="h-3 w-3 mr-1" />
        Early Bird Sold Out
      </Badge>
    );
  }

  const urgency = remaining <= 10 ? 'destructive' : remaining <= 25 ? 'secondary' : 'default';

  return (
    <Badge variant={urgency} className={`${className} flex items-center gap-1`}>
      <Clock className="h-3 w-3" />
      {remaining} / {max} Early Bird spots left
    </Badge>
  );
};