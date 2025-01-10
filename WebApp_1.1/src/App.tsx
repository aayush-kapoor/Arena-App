import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navigation } from './components/Navigation';
import { ThemeContext, Theme } from './lib/theme';
import { Auth } from './components/Auth';
import { Games } from './components/Games';
import { Discover } from './components/Discover';
import { SettingsLayout } from './components/SettingsLayout';
import { ProfileEditor } from './components/ProfileEditor';
import { DisplaySettings } from './components/DisplaySettings';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'display'>('profile');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  React.useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/login" element={<Auth />} />
              <Route path="/games" element={<Games />} />
              <Route path="/discover" element={<Discover />} />
              <Route
                path="/settings"
                element={
                  user ? (
                    <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
                      {activeTab === 'profile' ? <ProfileEditor /> : <DisplaySettings />}
                    </SettingsLayout>
                  ) : (
                    <Auth />
                  )
                }
              />
              <Route path="/" element={<Games />} />
            </Routes>
          </main>
        </div>
        <Toaster position="top-center" />
      </Router>
    </ThemeContext.Provider>
  );
}