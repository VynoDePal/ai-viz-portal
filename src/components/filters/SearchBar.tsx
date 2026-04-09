"use client";

import { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  suggestions?: string[];
}

export function SearchBar({
  placeholder = "Search...",
  onSearch,
  suggestions = [],
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0 && suggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(query.length > 0 && suggestions.length > 0)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </form>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
