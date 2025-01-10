/*
  # Create profiles table for sports community app

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - matches auth.users.id
      - `email` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text)
      - `preferred_sports` (text[]) - array of sports the user is interested in
      - `skill_levels` (jsonb) - mapping of sports to skill levels
      - `availability` (jsonb) - user's preferred playing times
      - `location` (text) - user's general location
      - `bio` (text) - user's description
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for authenticated users to:
      - Read any profile
      - Update their own profile
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  preferred_sports text[] DEFAULT '{}',
  skill_levels jsonb DEFAULT '{}',
  availability jsonb DEFAULT '{}',
  location text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();