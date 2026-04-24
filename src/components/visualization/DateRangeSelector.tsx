"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DateRangeSelectorProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  className?: string;
}

export function DateRangeSelector({
  onDateRangeChange,
  initialStartDate,
  initialEndDate,
  className = "",
}: DateRangeSelectorProps) {
  const [startDate, setStartDate] = useState(
    initialStartDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(initialEndDate || new Date());

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setStartDate(newDate);
    onDateRangeChange(newDate, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setEndDate(newDate);
    onDateRangeChange(startDate, newDate);
  };

  const setPresetRange = (days: number) => {
    const newEndDate = new Date();
    const newStartDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    onDateRangeChange(newStartDate, newEndDate);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Preset ranges */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setPresetRange(7)}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          7 days
        </button>
        <button
          onClick={() => setPresetRange(30)}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          30 days
        </button>
        <button
          onClick={() => setPresetRange(90)}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          90 days
        </button>
        <button
          onClick={() => setPresetRange(365)}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          1 year
        </button>
      </div>

      {/* Date inputs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Start Date
            </label>
            <input
              type="date"
              value={startDate.toISOString().split("T")[0]}
              onChange={handleStartDateChange}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-gray-500" />

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              End Date
            </label>
            <input
              type="date"
              value={endDate.toISOString().split("T")[0]}
              onChange={handleEndDateChange}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
