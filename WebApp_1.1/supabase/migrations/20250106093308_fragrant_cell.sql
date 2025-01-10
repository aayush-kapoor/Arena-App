/*
  # Create games table and related schemas

  1. New Tables
    - `games`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references profiles)
      - `title` (text)
      - `sport` (text)
      - `location` (text)
      - `date` (timestamptz)
      - `max_players` (int)
      - `registered_players` (uuid[], stores player IDs)
      - `description` (text)
      - `created_at` (timestamptz)
      - `status` (text: 'upcoming', 'in_progress', 'completed', 'cancelled')

  2. Security
    - Enable RLS on `games` table
    - Add policies for:
      - Anyone can view games
      - Only authenticated users can create games
      - Only game creator can update/delete games
*/

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  sport text NOT NULL,
  location text NOT NULL,
  date timestamptz NOT NULL,
  max_players int NOT NULL,
  registered_players uuid[] DEFAULT '{}',
  description text,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled'))
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view games"
  ON games
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create games"
  ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Creator can update their games"
  ON games
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Creator can delete their games"
  ON games
  FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);