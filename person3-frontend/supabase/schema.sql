-- ==============================================================================
-- SMART RECYCLE AI — Supabase Database Schema
-- Provides RLS, private user data isolation, and public recycling facilities
-- ==============================================================================

-- 1. Profiles Table (Private User Data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  municipality TEXT DEFAULT 'San Francisco, CA',
  unit_system TEXT DEFAULT 'metric',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Waste Scans Table (Image classification events)
CREATE TABLE IF NOT EXISTS public.waste_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence NUMERIC(4,3) NOT NULL,
  recyclable BOOLEAN NOT NULL,
  special_handling BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  disposal_method TEXT,
  instructions JSONB,
  estimated_weight_kg NUMERIC(6,3) DEFAULT 0.05,
  carbon_avoided_kg NUMERIC(6,3) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_waste_scans_user_id ON public.waste_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_scans_category ON public.waste_scans(category);
CREATE INDEX IF NOT EXISTS idx_waste_scans_created_at ON public.waste_scans(created_at DESC);

ALTER TABLE public.waste_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scans or guest scans"
  ON public.waste_scans FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert scans"
  ON public.waste_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 3. Recycling Events Table (Confirmed sorting actions)
CREATE TABLE IF NOT EXISTS public.recycling_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES public.waste_scans(id) ON DELETE SET NULL,
  sorted_correctly BOOLEAN DEFAULT TRUE NOT NULL,
  points_awarded INTEGER DEFAULT 15,
  verified_by_center BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recycling_events_user ON public.recycling_events(user_id);

ALTER TABLE public.recycling_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own recycling events"
  ON public.recycling_events FOR ALL
  USING (auth.uid() = user_id);

-- 4. Recycling Centers Table (Public Reference Directory)
CREATE TABLE IF NOT EXISTS public.recycling_centers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL,
  categories_accepted TEXT[] NOT NULL,
  phone TEXT,
  website TEXT,
  opening_hours TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_centers_city ON public.recycling_centers(city);
CREATE INDEX IF NOT EXISTS idx_centers_coords ON public.recycling_centers(latitude, longitude);

ALTER TABLE public.recycling_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read-only access for recycling centers"
  ON public.recycling_centers FOR SELECT
  USING (true);

-- 5. User Rewards Table (Gamification points and streaks)
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  points INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  streak_days INTEGER DEFAULT 0 NOT NULL,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  unlocked_badges TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update their own rewards"
  ON public.user_rewards FOR ALL
  USING (auth.uid() = user_id);

-- 6. Challenges Table
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_count INTEGER NOT NULL,
  points_reward INTEGER NOT NULL,
  challenge_type TEXT NOT NULL, -- 'daily', 'weekly', 'special'
  is_active BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for active challenges"
  ON public.challenges FOR SELECT
  USING (is_active = true);
