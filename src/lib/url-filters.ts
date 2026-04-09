/** URL parameter handling for filters */

export interface FilterState {
  organizations?: string[];
  categories?: string[];
  parameters?: [number, number];
  releaseDate?: [string, string];
  scores?: [number, number];
  search?: string;
}

/**
 * Serialize filter state to URL search parameters
 */
export function serializeFilters(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      if (typeof value[0] === "string") {
        // Multi-select arrays
        value.forEach((v) => params.append(key, v));
      } else {
        // Range arrays
        params.set(`${key}_min`, String(value[0]));
        params.set(`${key}_max`, String(value[1]));
      }
    } else {
      params.set(key, String(value));
    }
  });

  return params;
}

/**
 * Deserialize URL search parameters to filter state
 */
export function deserializeFilters(params: URLSearchParams): FilterState {
  const filters: FilterState = {};

  // Handle multi-select parameters
  const multiSelectKeys = ["organizations", "categories"];
  multiSelectKeys.forEach((key) => {
    const values = params.getAll(key);
    if (values.length > 0) {
      if (key === "organizations") {
        filters.organizations = values;
      } else if (key === "categories") {
        filters.categories = values;
      }
    }
  });

  // Handle range parameters
  const rangeKeys = ["parameters", "scores"];
  rangeKeys.forEach((key) => {
    const min = params.get(`${key}_min`);
    const max = params.get(`${key}_max`);
    if (min && max) {
      if (key === "parameters") {
        filters.parameters = [parseFloat(min), parseFloat(max)];
      } else if (key === "scores") {
        filters.scores = [parseFloat(min), parseFloat(max)];
      }
    }
  });

  // Handle date range
  const dateMin = params.get("releaseDate_min");
  const dateMax = params.get("releaseDate_max");
  if (dateMin && dateMax) {
    filters.releaseDate = [dateMin, dateMax];
  }

  // Handle search
  const search = params.get("search");
  if (search) {
    filters.search = search;
  }

  return filters;
}

/**
 * Update URL with current filters
 */
export function updateURL(filters: FilterState): void {
  const params = serializeFilters(filters);
  const newURL = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newURL);
}

/**
 * Load filters from current URL
 */
export function loadFiltersFromURL(): FilterState {
  const params = new URLSearchParams(window.location.search);
  return deserializeFilters(params);
}

/**
 * Clear all filters from URL
 */
export function clearFiltersFromURL(): void {
  const newURL = window.location.pathname;
  window.history.replaceState({}, "", newURL);
}
