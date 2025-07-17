import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { AppLayout } from '@/components/AppLayout';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    devex_rate: 0.0035,
  });
  const [settings, setSettings] = useState({
    marketplace_cut: 0.30,
    ad_tracking: true,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSettings();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, devex_rate')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('marketplace_cut, ad_tracking')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          devex_rate: profile.devex_rate,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          marketplace_cut: settings.marketplace_cut,
          ad_tracking: settings.ad_tracking,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <SubscriptionManager />

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  placeholder="Email address"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="devex_rate">DevEx Rate</Label>
              <Input
                id="devex_rate"
                type="number"
                step="0.0001"
                value={profile.devex_rate}
                onChange={(e) => setProfile({ ...profile, devex_rate: parseFloat(e.target.value) })}
                placeholder="0.0035"
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="marketplace_cut">Marketplace Cut (%)</Label>
              <Input
                id="marketplace_cut"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={settings.marketplace_cut}
                onChange={(e) => setSettings({ ...settings, marketplace_cut: parseFloat(e.target.value) })}
                placeholder="0.30"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ad_tracking"
                checked={settings.ad_tracking}
                onCheckedChange={(checked) => setSettings({ ...settings, ad_tracking: checked })}
              />
              <Label htmlFor="ad_tracking">Enable Ad Spend Tracking</Label>
            </div>
            <Button onClick={handleSaveSettings} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;