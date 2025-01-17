/*
  # Game Chat Messages Schema

  1. New Tables
    - `game_messages`
      - `id` (uuid, primary key)
      - `game_id` (uuid, references games)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `game_messages` table
    - Add policies for:
      - Registered players can read messages
      - Registered players can create messages
      - Users can update their own messages
*/

CREATE TABLE IF NOT EXISTS game_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE game_messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading messages only if user is registered for the game
CREATE POLICY "Registered players can read messages"
  ON game_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_messages.game_id
      AND games.registered_players @> ARRAY[auth.uid()]::uuid[]
    )
  );

-- Policy to allow creating messages only if user is registered for the game
CREATE POLICY "Registered players can create messages"
  ON game_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_messages.game_id
      AND games.registered_players @> ARRAY[auth.uid()]::uuid[]
    )
    AND auth.uid() = user_id
  );

-- Policy to allow updating own messages
CREATE POLICY "Users can update own messages"
  ON game_messages
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamp
CREATE TRIGGER update_game_messages_updated_at
  BEFORE UPDATE ON game_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();