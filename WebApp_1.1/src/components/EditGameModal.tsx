import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sportsList } from '../lib/constants';
import { cities } from '../lib/location-data';
import toast from 'react-hot-toast';
import { formFieldClasses } from '../lib/theme-utils';
import type { Game } from '../types';

// Flatten cities into a single array of options
const allCities = Object.values(cities).flat().map(city => ({
  value: city.label,
  label: city.label
}));

interface EditGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  onGameUpdated: () => void;
}

export function EditGameModal({ isOpen, onClose, game, onGameUpdated }: EditGameModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: game.title,
    sport: game.sport,
    location: game.location,
    date: new Date(game.date).toISOString().slice(0, 16),
    max_players: game.max_players,
    description: game.description || ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } = await supabase
        .from('games')
        .update({
          ...formData,
          description: formData.description || null
        })
        .eq('id', game.id);

      if (error) throw error;

      toast.success('Game updated successfully!');
      onGameUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating game:', error);
      toast.error('Failed to update game');
    } finally {
      setLoading(false);
    }
  }

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Edit Game
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className={formFieldClasses.label}>
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={formFieldClasses.input}
                      placeholder="Enter game title"
                    />
                  </div>

                  <div>
                    <label className={formFieldClasses.label}>
                      Sport
                    </label>
                    <select
                      required
                      value={formData.sport}
                      onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                      className={formFieldClasses.input}
                    >
                      <option value="">Select a sport</option>
                      {sportsList.map((sport) => (
                        <option key={sport} value={sport}>
                          {sport}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={formFieldClasses.label}>
                      Location
                    </label>
                    <select
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={formFieldClasses.input}
                    >
                      <option value="">Select a city</option>
                      {allCities.map((city) => (
                        <option key={city.value} value={city.value}>
                          {city.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={formFieldClasses.label}>
                      Date and Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={formFieldClasses.input}
                    />
                  </div>

                  <div>
                    <label className={formFieldClasses.label}>
                      Maximum Players
                    </label>
                    <input
                      type="number"
                      required
                      min={game.player_count}
                      max="50"
                      value={formData.max_players}
                      onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) })}
                      className={formFieldClasses.input}
                    />
                    {game.player_count > 0 && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Minimum value is {game.player_count} (current number of players)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={formFieldClasses.label}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={formFieldClasses.input}
                      rows={3}
                      placeholder="Add any additional details about the game"
                    />
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Updating...' : 'Update Game'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}