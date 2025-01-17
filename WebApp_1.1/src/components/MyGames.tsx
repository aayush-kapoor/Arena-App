import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GameCard } from './GameCard';
import { useAuth } from '../hooks/useAuth';
import { isPast } from 'date-fns';
import toast from 'react-hot-toast';
import type { Game } from '../types';

export function MyGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchGames();
    }
  }, [user]);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .contains('registered_players', [user?.id])
        .order('date', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const upcomingGames = games.filter(game => !isPast(new Date(game.date)));
  const pastGames = games.filter(game => isPast(new Date(game.date)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        My Games
      </h1>

      {/* Upcoming Games Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
          Upcoming Games
        </h2>
        {upcomingGames.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingGames.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                onRegistrationUpdate={fetchGames}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            You haven't registered for any upcoming games yet.
          </p>
        )}
      </section>

      {/* Past Games Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
          Past Games
        </h2>
        {pastGames.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastGames.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                onRegistrationUpdate={fetchGames}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            You haven't participated in any games yet.
          </p>
        )}
      </section>
    </div>
  );
}