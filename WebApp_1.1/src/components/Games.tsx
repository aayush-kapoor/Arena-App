import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CreateGameModal } from './CreateGameModal';
import { GameCard } from './GameCard';
import { useAuth } from '../hooks/useAuth';
import { isPast } from 'date-fns';
import toast from 'react-hot-toast';
import type { Game } from '../types';

export function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();

  const updateGameStatuses = async (games: Game[]) => {
    const updates = games.map(game => {
      if (game.status === 'upcoming' && isPast(new Date(game.date))) {
        return supabase
          .from('games')
          .update({ status: 'completed' })
          .eq('id', game.id);
      }
      return null;
    }).filter(Boolean);

    if (updates.length > 0) {
      await Promise.all(updates);
    }
  };

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*');

      if (error) throw error;
      
      if (data) {
        await updateGameStatuses(data);
        
        // Sort games: upcoming first (by date), then past games (by most recent)
        const sortedGames = data.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          const isAUpcoming = !isPast(dateA);
          const isBUpcoming = !isPast(dateB);

          if (isAUpcoming && !isBUpcoming) return -1;
          if (!isAUpcoming && isBUpcoming) return 1;
          
          // For upcoming games, sort by earliest first
          if (isAUpcoming && isBUpcoming) {
            return dateA.getTime() - dateB.getTime();
          }
          
          // For past games, sort by most recent first
          return dateB.getTime() - dateA.getTime();
        });

        setGames(sortedGames);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load games');
    }
  };

  useEffect(() => {
    fetchGames();

    const channel = supabase
      .channel('games_db_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games'
        },
        () => {
          fetchGames();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Separate games into upcoming and past
  const upcomingGames = games.filter(game => !isPast(new Date(game.date)));
  const pastGames = games.filter(game => isPast(new Date(game.date)));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Available Games
        </h1>
        {user && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Game
          </button>
        )}
      </div>

      {/* Upcoming Games Section */}
      {upcomingGames.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Upcoming Games
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingGames.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                onRegistrationUpdate={fetchGames}
              />
            ))}
          </div>
        </section>
      )}

      {/* Past Games Section */}
      {pastGames.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
            Past Games
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastGames.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                onRegistrationUpdate={fetchGames}
              />
            ))}
          </div>
        </section>
      )}

      <CreateGameModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGameCreated={fetchGames}
      />
    </div>
  );
}