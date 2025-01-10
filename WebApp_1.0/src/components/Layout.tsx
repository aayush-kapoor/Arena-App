// import React from 'react'; 
import { useAuth } from './auth/AuthContext';
import { LoginButton } from './auth/LoginButton';
import { Navigation } from './Navigation';
import { Bell, MessageSquare, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">SportsMate</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Bell className="w-6 h-6 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <MessageSquare className="w-6 h-6 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => signOut()}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <LogOut className="w-6 h-6 text-gray-600" />
                  </button>
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt={user.user_metadata.full_name}
                    className="h-8 w-8 rounded-full"
                  />
                </>
              ) : (
                <LoginButton />
              )}
            </div>
          </div>
        </div>
      </header>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}