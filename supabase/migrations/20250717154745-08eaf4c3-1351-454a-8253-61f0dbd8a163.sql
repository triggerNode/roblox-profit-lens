-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for item types
CREATE TYPE public.item_type AS ENUM ('GamePass', 'DevProduct', 'UGC', 'PremiumPayout', 'Other');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  devex_rate DECIMAL(10,4) DEFAULT 0.0035, -- Default DevEx rate
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  marketplace_cut DECIMAL(5,4) DEFAULT 0.30, -- 30% default Roblox cut
  ad_tracking BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create uploads table to track CSV uploads
CREATE TABLE public.uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_transactions INTEGER DEFAULT 0,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for parsed CSV data
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES public.uploads(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  source TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_type public.item_type NOT NULL,
  gross_robux DECIMAL(15,2) NOT NULL,
  marketplace_cut DECIMAL(15,2) NOT NULL DEFAULT 0,
  net_robux DECIMAL(15,2) NOT NULL,
  devex_rate DECIMAL(10,4) NOT NULL,
  gross_usd DECIMAL(15,2) NOT NULL DEFAULT 0,
  net_usd DECIMAL(15,2) NOT NULL DEFAULT 0,
  ad_spend DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for uploads
CREATE POLICY "Users can view own uploads" ON public.uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads" ON public.uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own uploads" ON public.uploads
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to calculate transaction USD values
CREATE OR REPLACE FUNCTION public.calculate_transaction_usd()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate marketplace cut (30% of gross robux by default)
  NEW.marketplace_cut = NEW.gross_robux * (
    SELECT COALESCE(marketplace_cut, 0.30) 
    FROM public.user_settings 
    WHERE user_id = NEW.user_id
  );
  
  -- Calculate net robux
  NEW.net_robux = NEW.gross_robux - NEW.marketplace_cut;
  
  -- Get user's DevEx rate
  NEW.devex_rate = COALESCE(NEW.devex_rate, (
    SELECT devex_rate 
    FROM public.profiles 
    WHERE user_id = NEW.user_id
  ), 0.0035);
  
  -- Calculate USD values
  NEW.gross_usd = NEW.gross_robux * NEW.devex_rate;
  NEW.net_usd = NEW.net_robux * NEW.devex_rate;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for USD calculations
CREATE TRIGGER calculate_usd_on_transaction
  BEFORE INSERT OR UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.calculate_transaction_usd();

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_item_type ON public.transactions(item_type);
CREATE INDEX idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX idx_uploads_status ON public.uploads(processing_status);