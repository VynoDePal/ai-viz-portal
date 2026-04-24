"use client";

import { useState } from "react";
import { MapPin, X } from "lucide-react";

interface Annotation {
  id: string;
  date: Date | string;
  title: string;
  description?: string;
  type?: "release" | "update" | "milestone" | "other";
}

interface TrendAnnotationsProps {
  annotations: Annotation[];
  onAdd?: (annotation: Omit<Annotation, "id">) => void;
  onRemove?: (id: string) => void;
  editable?: boolean;
  className?: string;
}

export function TrendAnnotations({
  annotations,
  onAdd,
  onRemove,
  editable = false,
  className = "",
}: TrendAnnotationsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "",
    description: "",
    type: "other" as const,
  });

  const handleAdd = () => {
    if (onAdd && newAnnotation.title) {
      onAdd({
        date: newAnnotation.date,
        title: newAnnotation.title,
        description: newAnnotation.description,
        type: newAnnotation.type,
      });
      setNewAnnotation({
        date: new Date().toISOString().split("T")[0],
        title: "",
        description: "",
        type: "other",
      });
      setShowAddForm(false);
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "release":
        return "bg-green-500";
      case "update":
        return "bg-blue-500";
      case "milestone":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Annotations list */}
      <div className="space-y-2">
        {annotations.map((annotation) => (
          <div
            key={annotation.id}
            className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div
              className={`w-3 h-3 rounded-full mt-1 ${getTypeColor(annotation.type)}`}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {annotation.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(annotation.date).toLocaleDateString()}
                </span>
              </div>
              {annotation.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {annotation.description}
                </p>
              )}
            </div>
            {editable && onRemove && (
              <button
                onClick={() => onRemove(annotation.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add annotation form */}
      {editable && (
        <div>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <MapPin className="w-4 h-4" />
              Add Annotation
            </button>
          ) : (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
              <input
                type="date"
                value={newAnnotation.date}
                onChange={(e) =>
                  setNewAnnotation({ ...newAnnotation, date: e.target.value })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <input
                type="text"
                placeholder="Title"
                value={newAnnotation.title}
                onChange={(e) =>
                  setNewAnnotation({ ...newAnnotation, title: e.target.value })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <textarea
                placeholder="Description (optional)"
                value={newAnnotation.description}
                onChange={(e) =>
                  setNewAnnotation({ ...newAnnotation, description: e.target.value })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={2}
              />
              <select
                value={newAnnotation.type}
                onChange={(e) =>
                  setNewAnnotation({
                    ...newAnnotation,
                    type: e.target.value as any,
                  })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="release">Release</option>
                <option value="update">Update</option>
                <option value="milestone">Milestone</option>
                <option value="other">Other</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
