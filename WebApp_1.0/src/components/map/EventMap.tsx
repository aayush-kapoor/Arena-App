import { useEffect, useRef, useState } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Event } from '../../types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { EventDialog } from '../events/EventDialog';
// import { supabase } from '../lib/supabase';
import 'leaflet/dist/leaflet.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface EventMapProps {
  events: Event[];
}
export function EventMap({ events }: EventMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40], // Default to NYC coordinates
      zoom: 9
    });

    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (map.current) {
          map.current.setCenter([position.coords.longitude, position.coords.latitude]);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  // Add event markers when events change
  useEffect(() => {
    if (!map.current) return;

    events.forEach(event => {
      if (!event.location.lat || !event.location.lng) return;

      const el = document.createElement('div');
      el.className = 'event-marker';
      
      new mapboxgl.Marker(el)
        .setLngLat([event.location.lng, event.location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <h3 class="font-bold">${event.title}</h3>
              <p>${event.sport.name}</p>
            `)
        )
        .addTo(map.current!);

      el.addEventListener('click', () => {
        setSelectedEvent(event);
      });
    });
  }, [events]);

  return (
    <>
      <div ref={mapContainer} className="w-full h-[400px] rounded-lg shadow-md" />
      {selectedEvent && (
        <EventDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isOpen={!!selectedEvent}
        >
          <div />
        </EventDialog>
      )}
    </>
  );
}