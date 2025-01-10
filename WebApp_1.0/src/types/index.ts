export interface User {
  id: string;
  name: string;
  email: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  sports: Sport[];
  skillLevels: Record<string, SkillLevel>;
  availability: Availability[];
  bio: string;
  avatar: string;
}

export interface Sport {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export enum SkillLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  SemiPro = "Semi-Professional"
}

export interface Event {
  id: string;
  sport: Sport;
  creator: User;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  datetime: string;
  maxPlayers: number;
  currentPlayers: User[];
  skillLevel: SkillLevel;
  status: "open" | "full" | "cancelled" | "completed";
}

export interface Availability {
  day: string;
  timeSlots: string[];
}