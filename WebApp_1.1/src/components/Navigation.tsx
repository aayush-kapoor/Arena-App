import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { User, Settings, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export function Navigation() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

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

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <a href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text">
                Arena
              </span>
            </a>

            {/* Navigation Links */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              <a
                href="/games"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Games
              </a>
              <a
                href="/discover"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Discover
              </a>
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              <Menu as="div" className="relative ml-3">
                <Menu.Button className="flex rounded-full bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center">
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

                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => navigate('/settings')}
                        className={`${
                          active ? 'bg-gray-50 dark:bg-gray-700' : ''
                        } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
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
                        className={`${
                          active ? 'bg-gray-50 dark:bg-gray-700' : ''
                        } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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