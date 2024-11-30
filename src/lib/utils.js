import { twMerge } from "tailwind-merge"

export function cn(...classes) {
  return twMerge(classes)
}

export function getThemeColor(mode) {
  return {
    primary: mode === 'light' ? '#2196f3' : '#90caf9',
    secondary: mode === 'light' ? '#f50057' : '#f48fb1',
    background: mode === 'light' ? '#f5f5f5' : '#0a0a0a',
    paper: mode === 'light' ? '#ffffff' : '#1a1a1a',
  }
} 