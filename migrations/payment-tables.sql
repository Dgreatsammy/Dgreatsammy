-- Create payment_intents table
CREATE TABLE IF NOT EXISTS public.payment_intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_reference TEXT NOT NULL,
  redirect_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Update subscriptions table to include payment information
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS payment_provider TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS payment_intents_user_id_idx ON public.payment_intents(user_id);
CREATE INDEX IF NOT EXISTS payment_intents_provider_reference_idx ON public.payment_intents(provider_reference);

-- Set up RLS (Row Level Security)
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payment intents" 
  ON public.payment_intents FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment intents" 
  ON public.payment_intents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_payment_intents_updated_at
  BEFORE UPDATE ON public.payment_intents
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
