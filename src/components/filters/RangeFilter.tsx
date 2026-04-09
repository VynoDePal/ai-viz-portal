"use client";

import { useState } from "react";

interface RangeFilterProps {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  unit?: string;
}

export function RangeFilter({
  label,
  min,
  max,
  value,
  onChange,
  step = 1,
  unit = "",
}: RangeFilterProps) {
  const [localMin, setLocalMin] = useState(value[0]);
  const [localMax, setLocalMax] = useState(value[1]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalMin(newValue);
    if (newValue <= localMax) {
      onChange([newValue, localMax]);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalMax(newValue);
    if (newValue >= localMin) {
      onChange([localMin, newValue]);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    const range = max - min;
    const midpoint = (localMin + localMax) / 2;
    
    if (newValue < midpoint) {
      const newMin = Math.max(min, newValue);
      setLocalMin(newMin);
      onChange([newMin, localMax]);
    } else {
      const newMax = Math.min(max, newValue);
      setLocalMax(newMax);
      onChange([localMin, newMax]);
    }
  };

  const clearRange = () => {
    setLocalMin(min);
    setLocalMax(max);
    onChange([min, max]);
  };

  const isDefault = localMin === min && localMax === max;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {!isDefault && (
          <button
            onClick={clearRange}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <input
          type="number"
          value={localMin}
          onChange={handleMinChange}
          min={min}
          max={max}
          step={step}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500">to</span>
        <input
          type="number"
          value={localMax}
          onChange={handleMaxChange}
          min={min}
          max={max}
          step={step}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={handleMinChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
              ((localMin - min) / (max - min)) * 100
            }%, #e5e7eb ${((localMin - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={handleMaxChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 absolute top-0 left-0 pointer-events-none"
          style={{
            background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${
              ((localMax - min) / (max - min)) * 100
            }%, #3b82f6 ${((localMax - min) / (max - min)) * 100}%, #3b82f6 100%)`,
            pointerEvents: "auto",
          }}
        />
      </div>

      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
