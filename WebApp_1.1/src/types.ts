export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  preferred_sports: string[] | null;
  skill_levels: Record<string, string> | null;
  availability: Record<string, any> | null;
  location: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  creator_id: string;
  title: string;
  sport: string;
  location: string;
  date: string;
  max_players: number;
  registered_players: string[];
  player_count: number;
  description: string | null;
  created_at: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
}

export interface GameMessage {
  id: string;
  game_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}