import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import type { MapRef } from 'react-map-gl';
import { MapPin, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { Game } from '../types';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  const mapRef = React.useRef<MapRef>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [popupAnchor, setPopupAnchor] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 11
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        const map = mapRef.current.getMap();
        map.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Determine the best position for the popup based on marker position
  const calculatePopupPosition = (markerLngLat: [number, number]) => {
    if (!mapRef.current) return 'top';
    
    const map = mapRef.current.getMap();
    const point = map.project(markerLngLat);
    const bounds = map.getBounds();
    const mapHeight = map.getContainer().offsetHeight;
    const mapWidth = map.getContainer().offsetWidth;
    
    const threshold = 200; // Popup width/height threshold

    if (point.y < threshold) {
      return 'bottom';
    } else if (point.y > mapHeight - threshold) {
      return 'top';
    } else if (point.x < mapWidth / 2) {
      return 'right';
    } else {
      return 'left';
    }
  };

  // Custom marker component
  const CustomMarker = useCallback(({ game }: { game: Game }) => {
    const isSelected = selectedGame?.id === game.id;
    const isFull = game.player_count >= game.max_players;
    
    return (
      <div className="cursor-pointer transform transition-all duration-200 hover:scale-110">
        <div className={`relative ${isSelected ? 'scale-110' : ''}`}>
          {/* Main pin container */}
          <div className={`
            flex items-center gap-1 px-2 py-1 rounded-full shadow-lg
            transform-gpu transition-all duration-200
            ${isSelected 
              ? 'bg-blue-500 scale-110' 
              : isFull 
                ? 'bg-gray-500'
                : 'bg-blue-500'
            }
          `}>
            {/* Sport icon or default pin */}
            <MapPin className="w-4 h-4 text-white" />
            
            {/* Player count with icon */}
            <div className="flex items-center gap-0.5 text-white">
              <Users className="w-3 h-3" />
              <span className="text-xs font-medium">{game.player_count}/{game.max_players}</span>
            </div>
          </div>

          {/* Bottom triangle */}
          <div className={`
            w-2 h-2 mx-auto mt-0.5
            transform rotate-45
            ${isSelected 
              ? 'bg-blue-500' 
              : isFull 
                ? 'bg-gray-500'
                : 'bg-blue-500'
            }
          `} />
        </div>
      </div>
    );
  }, [selectedGame]);

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
            setPopupAnchor(calculatePopupPosition([longitude, latitude]) as 'top' | 'bottom' | 'left' | 'right');
          }}
        >
          <CustomMarker game={game} />
        </Marker>
      );
    }), [games, CustomMarker, viewState]);

  // Calculate popup offset based on anchor
  const getPopupOffset = () => {
    switch (popupAnchor) {
      case 'top': return [0, -15];
      case 'bottom': return [0, 15];
      case 'left': return [-15, 0];
      case 'right': return [15, 0];
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="h-full relative rounded-xl overflow-hidden">
          <Map
            ref={mapRef}
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
            onClick={() => setSelectedGame(null)}
          >
            {markers}

            {/* Navigation Controls */}
            <NavigationControl position="bottom-right" />
            
            {/* Geolocation Control */}
            <GeolocateControl
              position="bottom-right"
              positionOptions={{ enableHighAccuracy: true }}
              trackUserLocation={true}
              showUserLocation={true}
            />

            {selectedGame && (
              <Popup
                longitude={getCoordinates(selectedGame.location)[0]}
                latitude={getCoordinates(selectedGame.location)[1]}
                anchor={popupAnchor}
                onClose={() => setSelectedGame(null)}
                closeOnClick={false}
                offset={getPopupOffset()}
                className="!rounded-xl overflow-hidden !p-0"
                maxWidth="300px"
              >
                <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white overflow-hidden">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-3">{selectedGame.title}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Sport</span>
                        <span className="text-blue-600 dark:text-blue-400">{selectedGame.sport}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Date</span>
                        <span>{format(new Date(selectedGame.date), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Players</span>
                        <span className="text-green-600 dark:text-green-400">
                          {selectedGame.player_count} / {selectedGame.max_players}
                        </span>
                      </div>
                      {selectedGame.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2 border-t dark:border-gray-700 pt-2">
                          {selectedGame.description}
                        </p>
                      )}
                      <button
                        onClick={() => navigate('/games')}
                        className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </div>
    </div>
  );
}