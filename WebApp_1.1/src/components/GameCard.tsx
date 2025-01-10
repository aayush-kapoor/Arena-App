import React, { useState } from 'react';
import { Calendar, MapPin, Users, Edit2, Trash2 } from 'lucide-react';
import { format, formatInTimeZone } from 'date-fns-tz';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { EditGameModal } from './EditGameModal';
import toast from 'react-hot-toast';
import type { Game } from '../types';

interface GameCardProps {
  game: Game;
  onRegistrationUpdate: () => void;
}

export function GameCard({ game, onRegistrationUpdate }: GameCardProps) {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const isCreator = user?.id === game.creator_id;
  const canEdit = isCreator && game.status === 'upcoming';
  const isGameFull = game.player_count >= game.max_players;
  const isRegistered = user && game.registered_players.includes(user.id);
  
  // Get user's timezone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const gameDate = new Date(game.date);
  
  // Format the date with timezone
  const formattedDate = `${format(gameDate, 'MMM d, yyyy')} at ${formatInTimeZone(
    gameDate,
    userTimeZone,
    'h:mm a'
  )} (${userTimeZone.replace(/_/g, ' ')})`;

  const handleDeleteGame = async () => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', game.id);

      if (error) throw error;
      toast.success('Game deleted successfully');
      onRegistrationUpdate();
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Failed to delete game');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRegistration = async () => {
    if (!user) {
      toast.error('Please sign in to register for games');
      return;
    }

    try {
      setIsRegistering(true);
      const newRegisteredPlayers = isRegistered
        ? game.registered_players.filter(id => id !== user.id)
        : [...game.registered_players, user.id];

      const { error } = await supabase
        .from('games')
        .update({
          registered_players: newRegisteredPlayers
        })
        .eq('id', game.id);

      if (error) throw error;
      
      toast.success(isRegistered ? 'Unregistered successfully' : 'Registered successfully');
      onRegistrationUpdate();
    } catch (error) {
      console.error('Error updating registration:', error);
      toast.error('Failed to update registration');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <>
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border transition-all ${
          isCreator 
            ? 'border-blue-200 dark:border-blue-800 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] dark:shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]'
            : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {game.title}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {game.sport}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  game.status === 'upcoming'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                </span>
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Edit game"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDeleteGame}
                  disabled={isDeleting}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Delete game"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
              <Calendar className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="h-4 w-4 mr-2" />
              {game.location}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Users className="h-4 w-4 mr-2" />
              {game.player_count} / {game.max_players} players
            </div>
          </div>

          {game.description && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              {game.description}
            </p>
          )}

          {game.status === 'upcoming' && !isCreator && (
            <div className="mt-6">
              <button
                onClick={handleRegistration}
                disabled={isRegistering || (isGameFull && !isRegistered)}
                className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isRegistered
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400'
                    : isGameFull
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                    : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                }`}
              >
                {isRegistered
                  ? 'Unregister'
                  : isGameFull
                  ? 'Game Full'
                  : 'Register'}
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <EditGameModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          game={game}
          onGameUpdated={onRegistrationUpdate}
        />
      )}
    </>
  );
}