import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { User, Lock } from 'lucide-react';
import { format } from 'date-fns';
import type { GameMessage, Game, Profile } from '../types';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface GameChatProps {
  game: Game;
  isRegistered: boolean;
}

export function GameChat({ game, isRegistered }: GameChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isRegistered) {
      fetchMessages();
      const subscription = subscribeToMessages();
      return () => {
        subscription();
      };
    }
  }, [game.id, isRegistered]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('game_messages')
        .select('*, profile:profiles(*)')
        .eq('game_id', game.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Create a map of profiles for quick lookup
      const profileMap: Record<string, Profile> = {};
      data?.forEach(message => {
        if (message.profile) {
          profileMap[message.profile.id] = message.profile;
        }
      });
      setProfiles(profileMap);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`game_${game.id}_messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_messages',
          filter: `game_id=eq.${game.id}`
        },
        async (payload) => {
          // Fetch the profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.user_id)
            .single();

          if (profile) {
            setProfiles(prev => ({
              ...prev,
              [profile.id]: profile
            }));
          }

          // Add the new message to the state
          setMessages(prev => [...prev, { ...payload.new, profile }]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('game_messages')
        .insert([
          {
            game_id: game.id,
            user_id: user.id,
            content: newMessage.trim()
          }
        ]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  if (!isRegistered) {
    return (
      <div className="relative h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 flex items-center justify-center">
          <div className="text-center p-6 rounded-lg">
            <Lock className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Chat Locked
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Register for this game to join the conversation
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[600px] flex flex-col">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const profile = profiles[message.user_id];
          const isCurrentUser = message.user_id === user?.id;

          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                isCurrentUser ? 'flex-row-reverse' : ''
              }`}
            >
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || ''}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
              <div
                className={`group max-w-[70%] ${
                  isCurrentUser ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium ${
                    isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {profile?.full_name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {format(new Date(message.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          );})}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}