import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]]
  return initials
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
}
