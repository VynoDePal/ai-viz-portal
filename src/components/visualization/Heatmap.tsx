"use client";

import { useState, useRef, useEffect } from "react";
import { getColorForScore, type ColorScheme } from "@/lib/colorScales";
import { Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface HeatmapData {
  model: string;
  benchmark: string;
  score: number;
}

interface HeatmapProps {
  data: HeatmapData[];
  colorScheme?: ColorScheme;
  cellSize?: number;
  onCellClick?: (data: HeatmapData) => void;
  className?: string;
}

export function Heatmap({
  data,
  colorScheme = "green-red",
  cellSize = 40,
  onCellClick,
  className = "",
}: HeatmapProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredCell, setHoveredCell] = useState<HeatmapData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const heatmapRef = useRef<HTMLDivElement>(null);

  // Get unique models and benchmarks
  const models = Array.from(new Set(data.map((d) => d.model)));
  const benchmarks = Array.from(new Set(data.map((d) => d.benchmark)));

  // Calculate min and max scores for color scaling
  const scores = data.map((d) => d.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  // Handle zoom
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Handle pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Handle cell hover
  const handleCellHover = (cellData: HeatmapData, e: React.MouseEvent) => {
    setHoveredCell(cellData);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleCellLeave = () => setHoveredCell(null);

  // Export as image
  const handleExport = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx || !heatmapRef.current) return;

    const width = models.length * cellSize + 100;
    const height = benchmarks.length * cellSize + 100;
    canvas.width = width;
    canvas.height = height;

    // Draw background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw cells
    data.forEach((d) => {
      const modelIndex = models.indexOf(d.model);
      const benchmarkIndex = benchmarks.indexOf(d.benchmark);
      const color = getColorForScore(d.score, minScore, maxScore, colorScheme);
      
      ctx.fillStyle = color;
      ctx.fillRect(
        modelIndex * cellSize + 50,
        benchmarkIndex * cellSize + 50,
        cellSize - 2,
        cellSize - 2
      );
    });

    // Download
    const link = document.createElement("a");
    link.download = "heatmap.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
        <button
          onClick={handleZoomIn}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={handleExport}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Export as image"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Heatmap container */}
      <div
        ref={heatmapRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ height: "600px" }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "top left",
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
        >
          {/* Benchmark labels (y-axis) */}
          <div style={{ position: "absolute", left: 0, top: 50 }}>
            {benchmarks.map((benchmark, i) => (
              <div
                key={benchmark}
                style={{
                  position: "absolute",
                  top: i * cellSize,
                  width: 40,
                  height: cellSize,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 8,
                  fontSize: "10px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {benchmark}
              </div>
            ))}
          </div>

          {/* Model labels (x-axis) */}
          <div style={{ position: "absolute", left: 50, top: 0 }}>
            {models.map((model, i) => (
              <div
                key={model}
                style={{
                  position: "absolute",
                  left: i * cellSize,
                  width: cellSize,
                  height: 40,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 8,
                  fontSize: "10px",
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                {model}
              </div>
            ))}
          </div>

          {/* Heatmap cells */}
          <div style={{ position: "absolute", left: 50, top: 50 }}>
            {data.map((d) => {
              const modelIndex = models.indexOf(d.model);
              const benchmarkIndex = benchmarks.indexOf(d.benchmark);
              const color = getColorForScore(d.score, minScore, maxScore, colorScheme);

              return (
                <div
                  key={`${d.model}-${d.benchmark}`}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  style={{
                    position: "absolute",
                    left: modelIndex * cellSize,
                    top: benchmarkIndex * cellSize,
                    width: cellSize - 2,
                    height: cellSize - 2,
                    backgroundColor: color,
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => handleCellHover(d, e)}
                  onMouseLeave={handleCellLeave}
                  onClick={() => onCellClick?.(d)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="absolute bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y + 10,
          }}
        >
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {hoveredCell.model}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {hoveredCell.benchmark}
          </div>
          <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">
            Score: {hoveredCell.score.toFixed(2)}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Low</span>
          <div
            className="w-32 h-4 rounded"
            style={{
              background: `linear-gradient(to right, ${getColorForScore(0, minScore, maxScore, colorScheme)}, ${getColorForScore(1, minScore, maxScore, colorScheme)})`,
            }}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">High</span>
        </div>
      </div>
    </div>
  );
}
