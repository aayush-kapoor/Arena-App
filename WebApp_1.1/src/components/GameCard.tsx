import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Edit2, Trash2, User } from 'lucide-react';
import { format, formatInTimeZone } from 'date-fns-tz';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { EditGameModal } from './EditGameModal';
import { GameDetailsModal } from './GameDetailsModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Game, Profile } from '../types';

interface GameCardProps {
  game: Game;
  onRegistrationUpdate: () => void;
}

export function GameCard({ game, onRegistrationUpdate }: GameCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [host, setHost] = useState<Profile | null>(null);
  const [players, setPlayers] = useState<Profile[]>([]);

  const isCreator = user?.id === game.creator_id;
  const canEdit = isCreator && game.status === 'upcoming';
  const isGameFull = game.player_count >= game.max_players;
  const isRegistered = user && game.registered_players.includes(user.id);
  
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const gameDate = new Date(game.date);
  
  const formattedDate = `${format(gameDate, 'MMM d, yyyy')} at ${formatInTimeZone(
    gameDate,
    userTimeZone,
    'h:mm a'
  )} (${userTimeZone.replace(/_/g, ' ')})`;

  useEffect(() => {
    fetchHostAndPlayers();
  }, [game.creator_id, game.registered_players]);

  const fetchHostAndPlayers = async () => {
    try {
      const { data: hostData, error: hostError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', game.creator_id)
        .single();

      if (hostError) throw hostError;
      setHost(hostData);

      const { data: playersData, error: playersError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', game.registered_players);

      if (playersError) throw playersError;
      setPlayers(playersData || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleDeleteGame = async () => {
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

  const handleRegistration = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
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

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.action-buttons')) {
      return;
    }
    setIsDetailsModalOpen(true);
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 cursor-pointer hover:shadow-[0_0_15px_-3px_rgba(236,72,153,0.3)] dark:hover:shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]"
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
              <div className="flex gap-2 action-buttons">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditModalOpen(true);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Edit game"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteModalOpen(true);
                  }}
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

          <div className="mt-4 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {host?.avatar_url ? (
                <img
                  src={host.avatar_url}
                  alt={host.full_name || ''}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Hosted by {host?.full_name || 'Anonymous'}
            </span>
          </div>

          {game.description && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              {game.description}
            </p>
          )}

          {game.status === 'upcoming' && !isCreator && (
            <div className="mt-6 action-buttons">
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

      <GameDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        game={game}
        host={host}
        players={players}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteGame}
        title="Delete Game"
      />
    </>
  );
}