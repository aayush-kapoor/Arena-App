/*
  # Initial Schema Setup for SportsMate

  1. New Tables
    - sports
      - Basic sports information
    - events
      - Event details including location and capacity
    - event_players
      - Junction table for event participants
    - profiles
      - Extended user profile information
    - user_sports
      - User's sports preferences and skill levels

  2. Security
    - RLS policies for all tables
    - Public read access for sports
    - Authenticated access for other operations
*/

-- Create sports table
CREATE TABLE sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text,
  avatar text,
  bio text,
  location_lat double precision,
  location_lng double precision,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_sports table
CREATE TABLE user_sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  sport_id uuid REFERENCES sports(id) ON DELETE CASCADE,
  skill_level text CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Semi-Professional')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, sport_id)
);

-- Create events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  sport_id uuid REFERENCES sports(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location_lat double precision NOT NULL,
  location_lng double precision NOT NULL,
  address text NOT NULL,
  datetime timestamptz NOT NULL,
  max_players integer NOT NULL,
  skill_level text CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Semi-Professional')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_players junction table
CREATE TABLE event_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_players ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access for sports" ON sports
  FOR SELECT TO public USING (true);

CREATE POLICY "Users can read all profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can read all user sports" ON user_sports
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own sport preferences" ON user_sports
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can read all events" ON events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create events" ON events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own events" ON events
  FOR UPDATE TO authenticated USING (auth.uid() = creator_id);

CREATE POLICY "Users can read all event players" ON event_players
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can join/leave events" ON event_players
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name, avatar)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- Trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();