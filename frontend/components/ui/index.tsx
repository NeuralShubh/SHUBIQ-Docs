'use client'
import { ReactNode, useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Currency } from '@/types'

// ── STATUS BADGE ──
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Paid: 's-paid', 
    Draft: 's-draft', 
    Unpaid: 's-unpaid', 
    Cancelled: 's-cancelled',
    'Partially Paid': 's-partial',
    Closed: 's-closed'
  }
  return <span className={`status-badge ${map[status] || 's-draft'}`}>{status}</span>
}

// ── TYPE BADGE ──
export function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    Invoice: 'tb-inv', Estimate: 'tb-est', Receipt: 'tb-rec'
  }
  return <span className={`type-badge ${map[type] || 'tb-inv'}`}>{type.slice(0, 3)}</span>
}

// ── STAT CARD ──
export function StatCard({
  label, value, change, crimson = false
}: { label: string; value: string; change?: string; crimson?: boolean }) {
  return (
    <div className={`stat-card${crimson ? ' crimson' : ''}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {change && <div className={`stat-change${crimson ? ' red' : ''}`}>{change}</div>}
    </div>
  )
}

// ── GLASS CARD ──
export function GlassCard({
  children, header, action
}: { children: ReactNode; header?: ReactNode; action?: ReactNode }) {
  return (
    <div className="glass-card">
      {header && (
        <div className="glass-card-header">
          <span className="glass-card-title">{header}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

// ── SECTION TITLE ──
export function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="section-title">{children}</div>
}

// ── FORM GROUP ──
export function FormGroup({
  label, children, full = false
}: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={`form-group${full ? ' full' : ''}`}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  )
}

// ── PAGE HEADER ──
export function PageHeader({
  title, subtitle, action
}: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ── TOAST ──
let _showToast: (msg: string, type?: 'success' | 'error' | 'info') => void = () => {}
export function showToast(msg: string, type: 'success' | 'error' | 'info' = 'info') {
  _showToast(msg, type)
}
export function ToastProvider() {
  const [toast, setToast] = useState<{ msg: string; type: string; show: boolean } | null>(null)
  useEffect(() => {
    _showToast = (msg, type = 'info') => {
      setToast({ msg, type, show: true })
      setTimeout(() => setToast(t => t ? { ...t, show: false } : null), 2200)
      setTimeout(() => setToast(null), 2600)
    }
  }, [])
  if (!toast) return null
  return (
    <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
      {toast.msg}
    </div>
  )
}

// ── EMPTY STATE ──
export function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
        {message}
      </td>
    </tr>
  )
}

// ── CONFIRM DIALOG ──
export function useConfirm() {
  return (message: string) => window.confirm(message)
}

// ── AMOUNT DISPLAY ──
export function Amount({ value, currency }: { value: number; currency: Currency }) {
  return (
    <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--c2)' }}>
      {formatCurrency(value, currency)}
    </span>
  )
}
