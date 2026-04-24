"use client";

import { useState, useMemo } from "react";

interface RadarModelData {
  name: string;
  color: string;
  scores: { [axis: string]: number };
}

interface RadarChartProps {
  axes: string[];
  models: RadarModelData[];
  size?: number;
  className?: string;
}

export function RadarChart({
  axes,
  models,
  size = 500,
  className = "",
}: RadarChartProps) {
  const [visibleModels, setVisibleModels] = useState<Set<string>>(
    new Set(models.map((m) => m.name))
  );
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);

  const center = size / 2;
  const radius = (size / 2) * 0.8;
  const angleStep = (2 * Math.PI) / axes.length;

  // Calculate point position on the circle
  const getPointPosition = (axisIndex: number, value: number) => {
    const angle = angleStep * axisIndex - Math.PI / 2;
    const normalizedValue = value / 100; // Assuming scores are 0-100
    const r = radius * normalizedValue;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Calculate polygon points for a model
  const getPolygonPoints = (model: RadarModelData) => {
    return axes.map((axis, i) => {
      const score = model.scores[axis] || 0;
      return getPointPosition(i, score);
    });
  };

  // Toggle model visibility
  const toggleModel = (modelName: string) => {
    setVisibleModels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modelName)) {
        newSet.delete(modelName);
      } else {
        newSet.add(modelName);
      }
      return newSet;
    });
  };

  const visibleModelData = models.filter((m) => visibleModels.has(m.name));

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {models.map((model) => (
          <button
            key={model.name}
            onClick={() => toggleModel(model.name)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border-2 transition-all ${
              visibleModels.has(model.name)
                ? "border-current opacity-100"
                : "border-gray-300 dark:border-gray-600 opacity-50"
            }`}
            style={{
              color: model.color,
              borderColor: visibleModels.has(model.name) ? model.color : undefined,
            }}
            onMouseEnter={() => setHoveredModel(model.name)}
            onMouseLeave={() => setHoveredModel(null)}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: model.color }}
            />
            <span className="text-sm font-medium">{model.name}</span>
          </button>
        ))}
      </div>

      {/* Radar Chart */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full h-auto"
      >
        {/* Background circles (grid) */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
          <circle
            key={scale}
            cx={center}
            cy={center}
            r={radius * scale}
            fill="none"
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        {axes.map((axis, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <g key={axis}>
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="currentColor"
                className="text-gray-300 dark:text-gray-600"
                strokeWidth="1"
              />
              {/* Axis label */}
              <text
                x={center + (radius + 20) * Math.cos(angle)}
                y={center + (radius + 20) * Math.sin(angle)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-gray-600 dark:fill-gray-400"
              >
                {axis}
              </text>
            </g>
          );
        })}

        {/* Model polygons */}
        {visibleModelData.map((model) => {
          const points = getPolygonPoints(model);
          const pointsString = points.map((p) => `${p.x},${p.y}`).join(" ");
          const isHovered = hoveredModel === model.name;
          const isOtherHovered = hoveredModel && hoveredModel !== model.name;

          return (
            <g
              key={model.name}
              onMouseEnter={() => setHoveredModel(model.name)}
              onMouseLeave={() => setHoveredModel(null)}
              className="transition-all duration-300"
              style={{
                opacity: isOtherHovered ? 0.3 : isHovered ? 1 : 0.7,
                transform: isHovered ? "scale(1.02)" : "scale(1)",
                transformOrigin: `${center}px ${center}px`,
              }}
            >
              {/* Fill */}
              <polygon
                points={pointsString}
                fill={model.color}
                fillOpacity={0.2}
                stroke={model.color}
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all duration-300"
              >
                <animate
                  attributeName="points"
                  from={pointsString}
                  to={pointsString}
                  dur="0.5s"
                  fill="freeze"
                />
              </polygon>

              {/* Points */}
              {points.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? 5 : 3}
                  fill={model.color}
                  className="transition-all duration-300"
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Empty state */}
      {visibleModelData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No models selected
        </div>
      )}
    </div>
  );
}
