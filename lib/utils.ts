import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
  }).format(price)
}

export function generateOrderNumber() {
  return `CMD${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase()
}
