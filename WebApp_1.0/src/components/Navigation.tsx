import React from 'react';
import { MapPin, Calendar, Users, Trophy, UserCircle } from 'lucide-react';
interface NavigationItem {
  name: string;
  icon: React.ElementType;
  path: string;
}

export function Navigation() {
  const items: NavigationItem[] = [
    { name: 'Discover', icon: MapPin, path: '/discover' },
    { name: 'Events', icon: Calendar, path: '/events' },
    { name: 'Teams', icon: Users, path: '/teams' },
    { name: 'Tournaments', icon: Trophy, path: '/tournaments' },
    { name: 'Profile', icon: UserCircle, path: '/profile' },
  ];

  const handleNavigation = (path: string) => {
    // For now, just show the Discover page when Discover is clicked
    if (path === '/discover') {
      window.location.href = '/discover';
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {items.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              className="flex items-center px-3 py-4 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-600"
            >
              <item.icon className="w-5 h-5 mr-2" />
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}