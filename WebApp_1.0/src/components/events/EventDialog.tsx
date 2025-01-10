import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, MapPin, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  spotsLeft: number;
  date: Date;
  image: string;
}

interface EventDialogProps {
  event: Event;
  children: React.ReactNode;
}

export function EventDialog({ event, children }: EventDialogProps) {
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    try {
      setIsJoining(true);
      // TODO: Add your API call here to join the event
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      alert('Successfully joined the event!');
    } catch (error) {
      console.error('Error joining event:', error);
      alert('Failed to join the event. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
          <Dialog.Close className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </Dialog.Close>

          <img
            src={event.image}
            alt={event.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />

          <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
          <p className="text-gray-600 mb-4">{event.description}</p>

          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{format(event.date, 'EEEE, MMMM d, yyyy - h:mm a')}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-2" />
              <span>{event.spotsLeft} spots remaining</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
            >
              {isJoining ? 'Joining...' : 'Join Event'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}