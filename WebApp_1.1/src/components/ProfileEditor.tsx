import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Save, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { sportsList } from '../lib/constants';
import { LocationSelector } from './LocationSelector';
import { formFieldClasses } from '../lib/theme-utils';
import type { Profile } from '../types';

export function ProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      toast.error('Error loading profile');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', profile.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Error updating profile');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) return null;

  const [country, state, city] = (profile.location || '').split(',').map(s => s.trim());

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="px-8 py-6 -mx-8 -mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg">
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
      </div>

      {/* Profile Form */}
      <form onSubmit={updateProfile} className="space-y-8">
        {/* Avatar and Name Section */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full dark:bg-gray-700 bg-gray-100 flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 dark:text-gray-500 text-gray-400" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <label className={formFieldClasses.label}>Full Name</label>
            <input
              type="text"
              value={profile.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className={formFieldClasses.input}
            />
          </div>
        </div>

        {/* Bio Section */}
        <div>
          <label className={formFieldClasses.label}>Bio</label>
          <textarea
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={3}
            className={formFieldClasses.input}
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Location */}
        <div>
          <label className={formFieldClasses.label}>Location</label>
          <LocationSelector
            value={{ country, state, city }}
            onChange={({ country, state, city }) => {
              const location = [country, state, city].filter(Boolean).join(', ');
              setProfile({ ...profile, location });
            }}
          />
        </div>

        {/* Preferred Sports */}
        <div>
          <label className={formFieldClasses.label}>
            Preferred Sports
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sportsList.map((sport) => (
              <label
                key={sport}
                className={formFieldClasses.sportCard(profile.preferred_sports?.includes(sport) || false)}
              >
                <input
                  type="checkbox"
                  checked={profile.preferred_sports?.includes(sport) || false}
                  onChange={(e) => {
                    const sports = profile.preferred_sports || [];
                    setProfile({
                      ...profile,
                      preferred_sports: e.target.checked
                        ? [...sports, sport]
                        : sports.filter((s) => s !== sport),
                    });
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-600"
                />
                {sport}
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}