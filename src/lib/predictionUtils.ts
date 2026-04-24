/**
 * Prediction utilities for forecasting model performance trends
 */

import { type TimeSeriesDataPoint, calculateTrendLine } from "./timeSeriesUtils";

export interface PredictionResult {
  predicted: TimeSeriesDataPoint[];
  confidenceInterval: {
    lower: number[];
    upper: number[];
  };
  accuracy: AccuracyMetrics;
}

export interface AccuracyMetrics {
  mae: number; // Mean Absolute Error
  mse: number; // Mean Squared Error
  rmse: number; // Root Mean Squared Error
  r2: number; // R-squared
}

/**
 * Linear trend prediction using regression
 */
export function predictLinearTrend(
  data: TimeSeriesDataPoint[],
  forecastDays: number
): PredictionResult {
  if (data.length < 2) {
    return {
      predicted: [],
      confidenceInterval: { lower: [], upper: [] },
      accuracy: { mae: 0, mse: 0, rmse: 0, r2: 0 },
    };
  }

  const trend = calculateTrendLine(data);
  const lastDate = new Date(data[data.length - 1].date);
  const lastValue = data[data.length - 1].value;

  // Generate predictions
  const predicted: TimeSeriesDataPoint[] = [];
  const lastIndex = data.length - 1;

  for (let i = 1; i <= forecastDays; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);
    const predictedValue = trend.intercept + trend.slope * (lastIndex + i);
    predicted.push({ date: futureDate, value: predictedValue });
  }

  // Calculate residuals for confidence interval
  const residuals = data.map((d, i) => {
    const predictedValue = trend.intercept + trend.slope * i;
    return d.value - predictedValue;
  });

  const stdError = Math.sqrt(
    residuals.reduce((sum, r) => sum + r * r, 0) / (residuals.length - 2)
  );

  // Calculate confidence intervals (95%)
  const lower: number[] = [];
  const upper: number[] = [];
  predicted.forEach((p) => {
    lower.push(p.value - 1.96 * stdError);
    upper.push(p.value + 1.96 * stdError);
  });

  // Calculate accuracy metrics
  const accuracy = calculateAccuracyMetrics(data, data.map((d, i) => ({
    date: d.date,
    value: trend.intercept + trend.slope * i,
  })));

  return {
    predicted,
    confidenceInterval: { lower, upper },
    accuracy,
  };
}

/**
 * Moving average prediction
 */
export function predictMovingAverage(
  data: TimeSeriesDataPoint[],
  forecastDays: number,
  windowSize: number = 5
): PredictionResult {
  if (data.length < windowSize) {
    return {
      predicted: [],
      confidenceInterval: { lower: [], upper: [] },
      accuracy: { mae: 0, mse: 0, rmse: 0, r2: 0 },
    };
  }

  const lastDate = new Date(data[data.length - 1].date);
  const recentData = data.slice(-windowSize);
  const average =
    recentData.reduce((sum, d) => sum + d.value, 0) / recentData.length;

  // Calculate standard deviation for confidence interval
  const variance =
    recentData.reduce((sum, d) => sum + Math.pow(d.value - average, 2), 0) /
    (windowSize - 1);
  const stdError = Math.sqrt(variance);

  // Generate predictions
  const predicted: TimeSeriesDataPoint[] = [];
  const lower: number[] = [];
  const upper: number[] = [];

  for (let i = 1; i <= forecastDays; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);
    predicted.push({ date: futureDate, value: average });
    lower.push(average - 1.96 * stdError);
    upper.push(average + 1.96 * stdError);
  }

  // Calculate accuracy metrics using historical data
  const historicalPredictions = data.map((d, i) => {
    if (i < windowSize - 1) {
      return { date: d.date, value: d.value };
    }
    const window = data.slice(i - windowSize + 1, i + 1);
    const avg = window.reduce((sum, w) => sum + w.value, 0) / window.length;
    return { date: d.date, value: avg };
  });

  const accuracy = calculateAccuracyMetrics(data, historicalPredictions);

  return {
    predicted,
    confidenceInterval: { lower, upper },
    accuracy,
  };
}

/**
 * Exponential smoothing prediction
 */
export function predictExponentialSmoothing(
  data: TimeSeriesDataPoint[],
  forecastDays: number,
  alpha: number = 0.3
): PredictionResult {
  if (data.length < 2) {
    return {
      predicted: [],
      confidenceInterval: { lower: [], upper: [] },
      accuracy: { mae: 0, mse: 0, rmse: 0, r2: 0 },
    };
  }

  // Calculate smoothed values
  const smoothed: number[] = [data[0].value];
  for (let i = 1; i < data.length; i++) {
    smoothed.push(
      alpha * data[i].value + (1 - alpha) * smoothed[i - 1]
    );
  }

  const lastDate = new Date(data[data.length - 1].date);
  const lastSmoothed = smoothed[smoothed.length - 1];

  // Calculate residuals for confidence interval
  const residuals = data.map((d, i) => d.value - smoothed[i]);
  const stdError = Math.sqrt(
    residuals.reduce((sum, r) => sum + r * r, 0) / (residuals.length - 1)
  );

  // Generate predictions
  const predicted: TimeSeriesDataPoint[] = [];
  const lower: number[] = [];
  const upper: number[] = [];

  for (let i = 1; i <= forecastDays; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);
    predicted.push({ date: futureDate, value: lastSmoothed });
    lower.push(lastSmoothed - 1.96 * stdError);
    upper.push(lastSmoothed + 1.96 * stdError);
  }

  // Calculate accuracy metrics
  const historicalPredictions = data.map((d, i) => ({
    date: d.date,
    value: smoothed[i],
  }));

  const accuracy = calculateAccuracyMetrics(data, historicalPredictions);

  return {
    predicted,
    confidenceInterval: { lower, upper },
    accuracy,
  };
}

/**
 * Calculate accuracy metrics
 */
export function calculateAccuracyMetrics(
  actual: TimeSeriesDataPoint[],
  predicted: TimeSeriesDataPoint[]
): AccuracyMetrics {
  if (actual.length !== predicted.length || actual.length === 0) {
    return { mae: 0, mse: 0, rmse: 0, r2: 0 };
  }

  const n = actual.length;
  let sumAE = 0; // Sum of Absolute Errors
  let sumSE = 0; // Sum of Squared Errors

  for (let i = 0; i < n; i++) {
    const error = actual[i].value - predicted[i].value;
    sumAE += Math.abs(error);
    sumSE += error * error;
  }

  const mae = sumAE / n;
  const mse = sumSE / n;
  const rmse = Math.sqrt(mse);

  // Calculate R-squared
  const actualMean = actual.reduce((sum, d) => sum + d.value, 0) / n;
  const ssTotal = actual.reduce((sum, d) => sum + Math.pow(d.value - actualMean, 2), 0);
  const ssResidual = sumSE;
  const r2 = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

  return { mae, mse, rmse, r2 };
}
