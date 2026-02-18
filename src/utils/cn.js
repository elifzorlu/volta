import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Convert snake_case to camelCase
function toCamelCase(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj?.map(item => toCamelCase(item));
  }

  // Handle non-object primitives
  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle objects
  const camelCased = {};
  for (const key in obj) {
    if (obj?.hasOwnProperty(key)) {
      // Convert snake_case key to camelCase
      const camelKey = key?.replace(/_([a-z])/g, (match, letter) => letter?.toUpperCase());
      // Recursively convert nested objects/arrays
      camelCased[camelKey] = toCamelCase(obj?.[key]);
    }
  }
  return camelCased;
}

export { toCamelCase };

// Convert camelCase to snake_case
function toSnakeCase(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj?.map(item => toSnakeCase(item));
  }

  // Handle non-object primitives
  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle objects
  const snakeCased = {};
  for (const key in obj) {
    if (obj?.hasOwnProperty(key)) {
      // Convert camelCase key to snake_case
      const snakeKey = key?.replace(/[A-Z]/g, letter => `_${letter?.toLowerCase()}`);
      // Recursively convert nested objects/arrays
      snakeCased[snakeKey] = toSnakeCase(obj?.[key]);
    }
  }
  return snakeCased;
}

export { toSnakeCase };