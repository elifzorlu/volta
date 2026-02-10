import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
function toCamelCase(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: toCamelCase is not implemented yet.', args);
  return null;
}

export { toCamelCase };
function toSnakeCase(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: toSnakeCase is not implemented yet.', args);
  return null;
}

export { toSnakeCase };