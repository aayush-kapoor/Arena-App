/*
  # Add player count tracking

  1. Changes
    - Add player_count column to games table
    - Add trigger to maintain player_count automatically
    - Update existing rows to set initial count
    - Add function to handle player count updates

  2. Security
    - No changes to RLS policies needed
    - Trigger runs with security definer to ensure counts stay accurate
*/

-- Add player_count column
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS player_count integer DEFAULT 0;

-- Update existing rows to set initial count
UPDATE games 
SET player_count = array_length(registered_players, 1)
WHERE player_count = 0;

-- Create function to update player count
CREATE OR REPLACE FUNCTION update_player_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.player_count := array_length(NEW.registered_players, 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to maintain player count
DROP TRIGGER IF EXISTS maintain_player_count ON games;
CREATE TRIGGER maintain_player_count
  BEFORE INSERT OR UPDATE OF registered_players
  ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_player_count();