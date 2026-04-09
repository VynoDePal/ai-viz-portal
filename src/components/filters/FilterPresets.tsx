"use client";

import { useState, useEffect } from "react";

interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
}

interface FilterPresetsProps {
  currentFilters: Record<string, any>;
  onLoadPreset: (filters: Record<string, any>) => void;
}

export function FilterPresets({ currentFilters, onLoadPreset }: FilterPresetsProps) {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState("");

  useEffect(() => {
    // Load presets from localStorage
    const savedPresets = localStorage.getItem("filterPresets");
    if (savedPresets) {
      setPresets(JSON.parse(savedPresets));
    }
  }, []);

  const savePreset = () => {
    if (!presetName.trim()) return;

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName,
      filters: currentFilters,
      createdAt: new Date().toISOString(),
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem("filterPresets", JSON.stringify(updatedPresets));
    
    setPresetName("");
    setShowSaveDialog(false);
  };

  const loadPreset = (preset: FilterPreset) => {
    onLoadPreset(preset.filters);
    setIsOpen(false);
  };

  const deletePreset = (id: string) => {
    const updatedPresets = presets.filter((p) => p.id !== id);
    setPresets(updatedPresets);
    localStorage.setItem("filterPresets", JSON.stringify(updatedPresets));
  };

  const sharePreset = (preset: FilterPreset) => {
    // Serialize filters to URL parameters
    const params = new URLSearchParams();
    Object.entries(preset.filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value !== null && value !== undefined) {
        params.set(key, String(value));
      }
    });

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    alert("Filter URL copied to clipboard!");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <span className="text-sm">Presets</span>
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
        <div className="absolute z-10 w-80 mt-2 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-3 border-b">
            <button
              onClick={() => setShowSaveDialog(true)}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Current Filters
            </button>
          </div>

          {showSaveDialog && (
            <div className="p-3 border-b bg-gray-50">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={savePreset}
                  className="flex-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setPresetName("");
                  }}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-auto">
            {presets.length === 0 ? (
              <p className="p-3 text-sm text-gray-500 text-center">No saved presets</p>
            ) : (
              presets.map((preset) => (
                <div
                  key={preset.id}
                  className="p-3 border-b hover:bg-gray-50 last:border-b-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{preset.name}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => loadPreset(preset)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                        title="Load"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => sharePreset(preset)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                        title="Share"
                      >
                        Share
                      </button>
                      <button
                        onClick={() => deletePreset(preset.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(preset.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
