import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { User, Settings, LogOut, CalendarDays, Map, GamepadIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
      console.error('Error:', error);
    }
  };

  const navLinks = [
    { href: '/games', label: 'Games', icon: GamepadIcon },
    { href: '/discover', label: 'Discover', icon: Map },
  ];

  return (
    <nav 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        isScrolled 
          ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm'
          : 'bg-white dark:bg-gray-800'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <a 
              href="/" 
              className={cn(
                "flex items-center transition-all",
                isScrolled ? 'scale-90' : ''
              )}
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text">
                Arena
              </span>
            </a>

            {/* Navigation Links */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => navigate(link.href)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === link.href
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/my-games')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === '/my-games'
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    My Games
                  </div>
                </button>
                <Menu as="div" className="relative">
                  <Menu.Button 
                    className={cn(
                      "flex rounded-lg transition-all",
                      isScrolled ? 'scale-90' : ''
                    )}
                  >
                    <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || ''}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </Menu.Button>

                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate('/my-games')}
                          className={cn(
                            'flex w-full items-center px-4 py-2 text-sm',
                            active 
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-200'
                          )}
                        >
                          <CalendarDays className="mr-3 h-4 w-4" />
                          My Games
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate('/settings')}
                          className={cn(
                            'flex w-full items-center px-4 py-2 text-sm',
                            active 
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-200'
                          )}
                        >
                          <Settings className="mr-3 h-4 w-4" />
                          Settings
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={cn(
                            'flex w-full items-center px-4 py-2 text-sm',
                            active 
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-700 dark:text-gray-200'
                          )}
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}