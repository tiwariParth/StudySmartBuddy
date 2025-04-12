import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function that merges multiple class names together using clsx and tailwind-merge
 * This allows for conditional classes and proper handling of Tailwind CSS class conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string
 */
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, length = 100) {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
