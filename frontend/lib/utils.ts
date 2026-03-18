import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Currency } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: Currency = 'INR'): string {
  const n = Number(amount) || 0
  if (currency === 'INR') return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 })
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function generateDocNumber(prefix: string, counter: number): string {
  return `${prefix}${String(counter).padStart(3, '0')}`
}

export function calculateTotals(items: { quantity: number; rate: number }[], taxRate: number) {
  const subtotal = items.reduce((s, i) => s + (Number(i.quantity) * Number(i.rate)), 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount
  return { subtotal: Math.round(subtotal * 100) / 100, taxAmount: Math.round(taxAmount * 100) / 100, total: Math.round(total * 100) / 100 }
}

export function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}
