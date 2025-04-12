import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
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
