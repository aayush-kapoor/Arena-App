import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function DisplaySettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Display Settings</h2>
      <div className="max-w-xl">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Theme Preference</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span className="font-medium">Dark</span>
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Choose your preferred theme for Arena. This setting will be saved and applied across all your sessions.
          </p>
        </div>
      </div>
    </div>
  );
}