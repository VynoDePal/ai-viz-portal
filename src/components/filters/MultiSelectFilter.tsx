"use client";

import { useState } from "react";

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select options...",
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const clearSelection = () => {
    onChange([]);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white flex justify-between items-center"
      >
        <span className={selected.length === 0 ? "text-gray-400" : "text-gray-900"}>
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b">
            <button
              onClick={clearSelection}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          </div>
          <div className="p-2">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
            >
              {item}
              <button
                onClick={() => toggleOption(item)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
