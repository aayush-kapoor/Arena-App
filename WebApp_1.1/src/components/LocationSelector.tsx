import React from 'react';
import Select from 'react-select';
import { countries, states, cities } from '../lib/location-data';

interface LocationSelectorProps {
  value: {
    country: string;
    state: string;
    city: string;
  };
  onChange: (location: { country: string; state: string; city: string }) => void;
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const selectedCountry = countries.find(c => c.value === value.country);
  const availableStates = states[value.country as keyof typeof states] || [];
  const selectedState = availableStates.find(s => s.value === value.state);
  const availableCities = cities[value.state as keyof typeof cities] || [];
  const selectedCity = availableCities.find(c => c.value === value.city);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country
        </label>
        <Select
          value={selectedCountry}
          onChange={(option) => {
            onChange({
              country: option?.value || '',
              state: '',
              city: ''
            });
          }}
          options={countries}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State
        </label>
        <Select
          value={selectedState}
          onChange={(option) => {
            onChange({
              ...value,
              state: option?.value || '',
              city: ''
            });
          }}
          options={availableStates}
          isDisabled={!value.country}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City
        </label>
        <Select
          value={selectedCity}
          onChange={(option) => {
            onChange({
              ...value,
              city: option?.value || ''
            });
          }}
          options={availableCities}
          isDisabled={!value.state}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
    </div>
  );
}