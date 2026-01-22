import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate an RFC 4122 v4 UUID string.
 */
export function generateId(): string {
  return crypto.randomUUID()
}
