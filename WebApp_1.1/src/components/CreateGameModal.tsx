import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sportsList } from '../lib/constants';
import { cities } from '../lib/location-data';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { formFieldClasses } from '../lib/theme-utils';

// Flatten cities into a single array of options
const allCities = Object.values(cities).flat().map(city => ({
  value: city.label,
  label: city.label
}));

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameCreated: () => void;
}

export function CreateGameModal({ isOpen, onClose, onGameCreated }: CreateGameModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    sport: '',
    location: '',
    date: '',
    max_players: 10,
    description: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('games')
        .insert([
          {
            ...formData,
            creator_id: user.id,
            registered_players: [user.id]
          }
        ]);

      if (error) throw error;

      toast.success('Game created successfully!');
      onGameCreated();
      onClose();
      setFormData({
        title: '',
        sport: '',
        location: '',
        date: '',
        max_players: 10,
        description: ''
      });
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
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
              as={Fragment}
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
                    Create New Game
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
                      min="2"
                      max="50"
                      value={formData.max_players}
                      onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) })}
                      className={formFieldClasses.input}
                    />
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
                      {loading ? 'Creating...' : 'Create Game'}
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