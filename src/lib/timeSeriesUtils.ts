/**
 * Time-series data processing utilities
 */

export interface TimeSeriesDataPoint {
  date: Date | string;
  value: number;
}

export interface TrendLine {
  slope: number;
  intercept: number;
  r2: number;
}

/**
 * Filter time-series data by date range
 */
export function filterByDateRange(
  data: TimeSeriesDataPoint[],
  startDate: Date,
  endDate: Date
): TimeSeriesDataPoint[] {
  return data.filter((point) => {
    const date = new Date(point.date);
    return date >= startDate && date <= endDate;
  });
}

/**
 * Group time-series data by interval (day, week, month, year)
 */
export function groupByInterval(
  data: TimeSeriesDataPoint[],
  interval: "day" | "week" | "month" | "year"
): TimeSeriesDataPoint[] {
  const grouped = new Map<string, TimeSeriesDataPoint[]>();

  data.forEach((point) => {
    const date = new Date(point.date);
    let key: string;

    switch (interval) {
      case "day":
        key = date.toISOString().split("T")[0];
        break;
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "year":
        key = String(date.getFullYear());
        break;
    }

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(point);
  });

  return Array.from(grouped.entries()).map(([key, points]) => ({
    date: key,
    value: points.reduce((sum, p) => sum + p.value, 0) / points.length,
  }));
}

/**
 * Calculate linear regression trend line
 */
export function calculateTrendLine(data: TimeSeriesDataPoint[]): TrendLine {
  const n = data.length;
  if (n < 2) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  const xValues = data.map((_, i) => i);
  const yValues = data.map((p) => p.value);

  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
  const sumY2 = yValues.reduce((sum, y) => sum + y * y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const yMean = sumY / n;
  const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const ssResidual = yValues.reduce(
    (sum, y, i) => sum + Math.pow(y - (slope * xValues[i] + intercept), 2),
    0
  );
  const r2 = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

  return { slope, intercept, r2 };
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(
  data: TimeSeriesDataPoint[],
  windowSize: number
): TimeSeriesDataPoint[] {
  if (windowSize <= 1 || data.length === 0) {
    return data;
  }

  const result: TimeSeriesDataPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1);
    const average = window.reduce((sum, p) => sum + p.value, 0) / window.length;
    result.push({ date: data[i].date, value: average });
  }

  return result;
}

/**
 * Calculate percentage change between points
 */
export function calculatePercentageChange(
  data: TimeSeriesDataPoint[]
): number[] {
  if (data.length < 2) {
    return [0];
  }

  const changes: number[] = [0];

  for (let i = 1; i < data.length; i++) {
    const prevValue = data[i - 1].value;
    const currValue = data[i].value;
    const change = prevValue === 0 ? 0 : ((currValue - prevValue) / prevValue) * 100;
    changes.push(change);
  }

  return changes;
}

/**
 * Detect outliers in time-series data using IQR method
 */
export function detectOutliers(data: TimeSeriesDataPoint[]): TimeSeriesDataPoint[] {
  if (data.length < 4) {
    return [];
  }

  const values = data.map((p) => p.value).sort((a, b) => a - b);
  const q1 = values[Math.floor(values.length * 0.25)];
  const q3 = values[Math.floor(values.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return data.filter((p) => p.value < lowerBound || p.value > upperBound);
}
