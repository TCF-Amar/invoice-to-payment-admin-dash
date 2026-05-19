import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names and resolves Tailwind CSS conflicts.
 *
 * - Uses `clsx` to join multiple class values (strings, arrays, objects,
 *   conditionals) into a single space-separated string while dropping
 *   falsy values (false, null, undefined, 0, '').
 * - Uses `twMerge` to deduplicate conflicting Tailwind utilities so the
 *   last one in the same class group wins (e.g. `px-2 px-4` -> `px-4`,
 *   `text-red-500 text-blue-500` -> `text-blue-500`).
 *
 * Useful for components that accept a `className` prop and need to merge
 * caller overrides cleanly with default styles.
 *
 * @param inputs - Any mix of class values supported by clsx.
 * @returns A merged, conflict-free Tailwind class string.
 *
 * @example
 * cn('p-4 bg-white', isActive && 'bg-indigo-500', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
