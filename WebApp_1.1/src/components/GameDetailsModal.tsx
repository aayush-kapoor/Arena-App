import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Calendar, MapPin, Users, X, User, MessageCircle, Info } from 'lucide-react';
import { format, formatInTimeZone } from 'date-fns-tz';
import { GameChat } from './GameChat';
import { cn } from '../lib/utils';
import type { Game, Profile } from '../types';
import { useAuth } from '../hooks/useAuth';

interface GameDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  host: Profile | null;
  players: Profile[];
}

type Tab = 'info' | 'chat';

export function GameDetailsModal({ isOpen, onClose, game, host, players }: GameDetailsModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const isRegistered = user && game.registered_players.includes(user.id);
  
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const gameDate = new Date(game.date);
  
  const formattedDate = `${format(gameDate, 'MMM d, yyyy')} at ${formatInTimeZone(
    gameDate,
    userTimeZone,
    'h:mm a'
  )} (${userTimeZone.replace(/_/g, ' ')})`;

  const tabs = [
    { id: 'info', label: 'Game Information', icon: Info },
    { id: 'chat', label: 'Game Chat', icon: MessageCircle }
  ] as const;

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                <div className="flex h-[800px]">
                  {/* Sidebar */}
                  <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                        {game.title}
                      </Dialog.Title>
                    </div>
                    <nav className="p-4 space-y-2">
                      {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => setActiveTab(id)}
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

                  {/* Main Content */}
                  <div className="flex-1">
                    <div className="flex justify-end p-4 border-b border-gray-200 dark:border-gray-700">
                      <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="h-[calc(800px-65px)] overflow-y-auto">
                      {activeTab === 'info' ? (
                        <div className="p-6">
                          {/* Host Information */}
                          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Host</h3>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                                {host?.avatar_url ? (
                                  <img
                                    src={host.avatar_url}
                                    alt={host.full_name || ''}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <User className="h-6 w-6 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {host?.full_name || 'Anonymous'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {host?.location || 'Location not specified'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Game Details */}
                          <div className="space-y-4 mb-8">
                            <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                              <Calendar className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                              <span>{formattedDate}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <MapPin className="h-5 w-5 mr-3" />
                              {game.location}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <Users className="h-5 w-5 mr-3" />
                              {game.player_count} / {game.max_players} players
                            </div>
                          </div>

                          {game.description && (
                            <div className="mb-8">
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Description
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {game.description}
                              </p>
                            </div>
                          )}

                          {/* Players List */}
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                              Registered Players ({players.length})
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              {players.map((player) => (
                                <div
                                  key={player.id}
                                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                >
                                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                                    {player.avatar_url ? (
                                      <img
                                        src={player.avatar_url}
                                        alt={player.full_name || ''}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <User className="h-5 w-5 text-gray-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {player.full_name || 'Anonymous'}
                                    </p>
                                    {player.location && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {player.location}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <GameChat game={game} isRegistered={isRegistered} />
                      )}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}