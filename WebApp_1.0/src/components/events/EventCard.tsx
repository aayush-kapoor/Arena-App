import { format } from 'date-fns';
import { MapPin, Users } from 'lucide-react';
import { Event } from '../../types';
import { EventDialog } from './EventDialog';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <EventDialog event={event}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
        <img
          src={`https://source.unsplash.com/800x600/?${event.sport.name}`}
          alt={event.sport.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold">{event.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{event.description}</p>
          <div className="flex items-center mt-3 text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            {event.location.address}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {format(new Date(event.datetime), 'PPp')}
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              {event.currentPlayers.length}/{event.maxPlayers}
            </div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
              {event.skillLevel}
            </span>
          </div>
        </div>
      </div>
    </EventDialog>
  );
}