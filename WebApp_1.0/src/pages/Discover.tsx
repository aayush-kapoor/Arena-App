import { EventMap } from '../components/map/EventMap';
import { EventCard } from '../components/events/EventCard';
import { Search, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Event } from '../types';
import { supabase } from '../lib/supabase';

export function Discover() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*, sport(*), creator(*), currentPlayers(*)')
          .eq('status', 'open');
        
        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search for sports or events..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </button>
      </div>


      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
          Loading map...
        </div>
      ) : (
        <EventMap events={events} />
      )}

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nearby Events</h2>
        {isLoading ? (
          <div>Loading events...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}