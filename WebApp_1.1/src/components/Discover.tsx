import React, { useEffect, useState, useMemo } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { Game } from '../types';
import 'mapbox-gl/dist/mapbox-gl.css';

// Replace with your Mapbox access token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Helper function to get coordinates from location string
function getCoordinates(location: string): [number, number] {
  // This is a simplified version. In a real app, you'd use a geocoding service
  const coordinates: Record<string, [number, number]> = {
    'San Francisco': [-122.4194, 37.7749],
    'Los Angeles': [-118.2437, 34.0522],
    'New York City': [-74.0060, 40.7128],
    'Buffalo': [-78.8784, 42.8864],
    'Houston': [-95.3698, 29.7604],
    'Austin': [-97.7431, 30.2672],
    'Mumbai': [72.8777, 19.0760],
    'Pune': [73.8567, 18.5204],
    'New Delhi': [77.2090, 28.6139],
    'North West Delhi': [77.1025, 28.7041],
    'Bangalore': [77.5946, 12.9716],
    'Mysore': [76.6394, 12.2958],
  };
  return coordinates[location] || [-122.4194, 37.7749]; // Default to SF if location not found
}

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

export function Discover() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 11
  });

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewState({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            zoom: 11
          });
        },
        () => {
          // If location access is denied, default to San Francisco
          console.log('Using default location');
        }
      );
    }

    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'upcoming')
        .order('date', { ascending: true });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  // Memoize markers to prevent unnecessary re-renders
  const markers = useMemo(() => 
    games.map(game => {
      const [longitude, latitude] = getCoordinates(game.location);
      return (
        <Marker
          key={game.id}
          longitude={longitude}
          latitude={latitude}
          anchor="bottom"
          onClick={e => {
            e.originalEvent.stopPropagation();
            setSelectedGame(game);
          }}
        >
          <div className="cursor-pointer transform transition-transform hover:scale-110">
            <div className="relative">
              <MapPin className="w-8 h-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {game.player_count}
              </div>
            </div>
          </div>
        </Marker>
      );
    }), [games]);

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={() => setSelectedGame(null)}
      >
        {markers}

        {selectedGame && (
          <Popup
            longitude={getCoordinates(selectedGame.location)[0]}
            latitude={getCoordinates(selectedGame.location)[1]}
            anchor="bottom"
            onClose={() => setSelectedGame(null)}
            closeOnClick={false}
            className="min-w-[300px]"
          >
            <div className="p-2">
              <h3 className="text-lg font-semibold mb-2">{selectedGame.title}</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Sport:</span>
                  {selectedGame.sport}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Date:</span>
                  {format(new Date(selectedGame.date), 'MMM d, yyyy h:mm a')}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Players:</span>
                  {selectedGame.player_count} / {selectedGame.max_players}
                </p>
                {selectedGame.description && (
                  <p className="text-gray-600">{selectedGame.description}</p>
                )}
                <button
                  onClick={() => navigate('/games')}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}