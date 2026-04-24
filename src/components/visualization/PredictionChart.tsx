"use client";

import { useMemo } from "react";
import { TrendLine, calculateTrendLine, type TimeSeriesDataPoint } from "@/lib/timeSeriesUtils";
import {
  predictLinearTrend,
  predictMovingAverage,
  predictExponentialSmoothing,
  type PredictionResult,
} from "@/lib/predictionUtils";

type PredictionMethod = "linear" | "moving-average" | "exponential-smoothing";

interface PredictionChartProps {
  data: TimeSeriesDataPoint[];
  method?: PredictionMethod;
  forecastDays?: number;
  showConfidenceInterval?: boolean;
  showAccuracyMetrics?: boolean;
  className?: string;
  height?: number;
}

export function PredictionChart({
  data,
  method = "linear",
  forecastDays = 7,
  showConfidenceInterval = true,
  showAccuracyMetrics = true,
  className = "",
  height = 400,
}: PredictionChartProps) {
  const prediction = useMemo(() => {
    switch (method) {
      case "linear":
        return predictLinearTrend(data, forecastDays);
      case "moving-average":
        return predictMovingAverage(data, forecastDays);
      case "exponential-smoothing":
        return predictExponentialSmoothing(data, forecastDays);
    }
  }, [data, method, forecastDays]);

  const { xScale, yScale, allData } = useMemo(() => {
    const combinedData = [...data, ...prediction.predicted];
    const dates = combinedData.map((d) => new Date(d.date).getTime());
    const values = combinedData.map((d) => d.value);

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

    return { xScale, yScale, allData: combinedData };
  }, [data, prediction]);

  const trendLine = useMemo(() => {
    return calculateTrendLine(data);
  }, [data]);

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

        {/* Confidence interval */}
        {showConfidenceInterval && prediction.predicted.length > 0 && (
          <g>
            {prediction.predicted.map((p, i) => {
              const x = xScale(new Date(p.date));
              const lowerY = yScale(prediction.confidenceInterval.lower[i]);
              const upperY = yScale(prediction.confidenceInterval.upper[i]);
              return (
                <line
                  key={i}
                  x1={x}
                  y1={lowerY}
                  x2={x}
                  y2={upperY}
                  stroke="currentColor"
                  className="text-blue-300 dark:text-blue-700"
                  strokeWidth={0.5}
                />
              );
            })}
          </g>
        )}

        {/* Historical data line */}
        {data.length > 0 && (
          <polyline
            points={data
              .map((d) => {
                const x = xScale(new Date(d.date));
                const y = yScale(d.value);
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="currentColor"
            className="text-blue-600 dark:text-blue-400"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Prediction line */}
        {prediction.predicted.length > 0 && (
          <polyline
            points={prediction.predicted
              .map((d) => {
                const x = xScale(new Date(d.date));
                const y = yScale(d.value);
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="currentColor"
            className="text-green-600 dark:text-green-400"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="3,3"
          />
        )}

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={`historical-${i}`}
            cx={xScale(new Date(d.date))}
            cy={yScale(d.value)}
            r={1}
            fill="currentColor"
            className="text-blue-600 dark:text-blue-400"
          />
        ))}

        {/* Prediction points */}
        {prediction.predicted.map((d, i) => (
          <circle
            key={`prediction-${i}`}
            cx={xScale(new Date(d.date))}
            cy={yScale(d.value)}
            r={1}
            fill="currentColor"
            className="text-green-600 dark:text-green-400"
          />
        ))}

        {/* Axes */}
        <line x1={0} y1={100} x2={100} y2={100} stroke="currentColor" className="text-gray-400" strokeWidth={1} />
        <line x1={0} y1={0} x2={0} y2={100} stroke="currentColor" className="text-gray-400" strokeWidth={1} />
      </svg>

      {/* Legend */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-400" />
          <span className="text-xs text-gray-700 dark:text-gray-300">Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600 dark:bg-green-400" />
          <span className="text-xs text-gray-700 dark:text-gray-300">Prediction</span>
        </div>
        {showConfidenceInterval && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-blue-300 dark:bg-blue-700" />
            <span className="text-xs text-gray-700 dark:text-gray-300">95% CI</span>
          </div>
        )}
      </div>

      {/* Accuracy metrics */}
      {showAccuracyMetrics && (
        <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
          <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
            Accuracy Metrics
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 dark:text-gray-400">
            <div>MAE: {prediction.accuracy.mae.toFixed(2)}</div>
            <div>MSE: {prediction.accuracy.mse.toFixed(2)}</div>
            <div>RMSE: {prediction.accuracy.rmse.toFixed(2)}</div>
            <div>R²: {prediction.accuracy.r2.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
