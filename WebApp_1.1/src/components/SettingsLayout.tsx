import React from 'react';
import { Settings, User, Monitor } from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsLayoutProps {
  activeTab: 'profile' | 'display';
  onTabChange: (tab: 'profile' | 'display') => void;
  children: React.ReactNode;
}

export function SettingsLayout({ activeTab, onTabChange, children }: SettingsLayoutProps) {
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'display', label: 'Display', icon: Monitor },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
                </div>
              </div>
              <nav className="p-4 space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => onTabChange(id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all',
                      activeTab === id
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}