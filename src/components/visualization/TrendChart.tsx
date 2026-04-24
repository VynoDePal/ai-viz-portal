"use client";

import { useMemo } from "react";
import { TrendLine, calculateTrendLine, type TimeSeriesDataPoint } from "@/lib/timeSeriesUtils";

interface TrendSeries {
  name: string;
  color: string;
  data: TimeSeriesDataPoint[];
}

interface TrendChartProps {
  series: TrendSeries[];
  showTrendLines?: boolean;
  className?: string;
  height?: number;
}

export function TrendChart({
  series,
  showTrendLines = true,
  className = "",
  height = 400,
}: TrendChartProps) {
  const { xScale, yScale, allData } = useMemo(() => {
    const allData = series.flatMap((s) => s.data);
    const dates = allData.map((d) => new Date(d.date).getTime());
    const values = allData.map((d) => d.value);

    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const xScale = (date: Date) => {
      const time = new Date(date).getTime();
      return ((time - minDate) / (maxDate - minDate)) * 100;
    };

    const yScale = (value: number) => {
      return 100 - ((value - minValue) / (maxValue - minValue)) * 100;
    };

    return { xScale, yScale, allData };
  }, [series]);

  const trendLines = useMemo(() => {
    if (!showTrendLines) return [];
    return series.map((s) => ({
      series: s.name,
      trend: calculateTrendLine(s.data),
    }));
  }, [series, showTrendLines]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1={0}
            y1={y}
            x2={100}
            y2={y}
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700"
            strokeWidth={0.5}
          />
        ))}

        {/* Trend lines */}
        {trendLines.map((tl) => {
          const { trend, series: seriesName } = tl;
          const seriesData = series.find((s) => s.name === seriesName);
          if (!seriesData || seriesData.data.length < 2) return null;

          const points = seriesData.data.map((d, i) => {
            const x = xScale(new Date(d.date));
            const y = yScale(trend.intercept + trend.slope * i);
            return `${x},${y}`;
          }).join(" ");

          return (
            <polyline
              key={seriesName}
              points={points}
              fill="none"
              stroke={seriesData.color}
              strokeWidth={0.5}
              strokeDasharray="2,2"
              opacity={0.5}
            />
          );
        })}

        {/* Data lines */}
        {series.map((s) => {
          if (s.data.length === 0) return null;

          const points = s.data.map((d) => {
            const x = xScale(new Date(d.date));
            const y = yScale(d.value);
            return `${x},${y}`;
          }).join(" ");

          return (
            <g key={s.name}>
              <polyline
                points={points}
                fill="none"
                stroke={s.color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Data points */}
              {s.data.map((d, i) => (
                <circle
                  key={i}
                  cx={xScale(new Date(d.date))}
                  cy={yScale(d.value)}
                  r={1}
                  fill={s.color}
                  className="hover:r-2 transition-all"
                />
              ))}
            </g>
          );
        })}

        {/* Axes */}
        <line x1={0} y1={100} x2={100} y2={100} stroke="currentColor" className="text-gray-400" strokeWidth={1} />
        <line x1={0} y1={0} x2={0} y2={100} stroke="currentColor" className="text-gray-400" strokeWidth={1} />
      </svg>

      {/* Legend */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
        {series.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-gray-700 dark:text-gray-300">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
