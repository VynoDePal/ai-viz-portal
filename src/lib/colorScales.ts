/**
 * Color scale utilities for heatmap visualizations
 */

export type ColorScheme = "green-red" | "blue-red" | "purple-green" | "grayscale";

/**
 * Convert a normalized value (0-1) to a color using the specified scheme
 * @param value - Normalized value between 0 and 1
 * @param scheme - Color scheme to use
 * @returns CSS color string
 */
export function getColorForValue(value: number, scheme: ColorScheme = "green-red"): string {
  const clampedValue = Math.max(0, Math.min(1, value));

  switch (scheme) {
    case "green-red":
      return getGreenRedColor(clampedValue);
    case "blue-red":
      return getBlueRedColor(clampedValue);
    case "purple-green":
      return getPurpleGreenColor(clampedValue);
    case "grayscale":
      return getGrayscaleColor(clampedValue);
    default:
      return getGreenRedColor(clampedValue);
  }
}

/**
 * Green to red color scale (green = good, red = bad)
 */
function getGreenRedColor(value: number): string {
  // High value (1) = green (good performance)
  // Low value (0) = red (bad performance)
  const red = Math.round(255 * (1 - value));
  const green = Math.round(255 * value);
  return `rgb(${red}, ${green}, 0)`;
}

/**
 * Blue to red color scale
 */
function getBlueRedColor(value: number): string {
  const red = Math.round(255 * value);
  const blue = Math.round(255 * (1 - value));
  return `rgb(${red}, 0, ${blue})`;
}

/**
 * Purple to green color scale
 */
function getPurpleGreenColor(value: number): string {
  const r = Math.round(128 * (1 - value));
  const g = Math.round(255 * value);
  const b = Math.round(128 * (1 - value));
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Grayscale color scale
 */
function getGrayscaleColor(value: number): string {
  const gray = Math.round(255 * value);
  return `rgb(${gray}, ${gray}, ${gray})`;
}

/**
 * Normalize a value to a 0-1 range based on min and max
 * @param value - Value to normalize
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Normalized value between 0 and 1
 */
export function normalizeValue(value: number, min: number, max: number): number {
  if (min === max) return 0.5;
  return (value - min) / (max - min);
}

/**
 * Get color for a score with automatic min/max detection
 * @param score - Score value
 * @param minScore - Minimum score in dataset
 * @param maxScore - Maximum score in dataset
 * @param scheme - Color scheme to use
 * @returns CSS color string
 */
export function getColorForScore(
  score: number,
  minScore: number,
  maxScore: number,
  scheme: ColorScheme = "green-red"
): string {
  const normalized = normalizeValue(score, minScore, maxScore);
  return getColorForValue(normalized, scheme);
}
