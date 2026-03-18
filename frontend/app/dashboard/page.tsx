'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import { StatCard, GlassCard, StatusBadge, TypeBadge, ToastProvider, showToast } from '@/components/ui'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(() => showToast('Failed to load dashboard', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const s = data?.stats || {}
  const docs = data?.recent || []
  const fmt = (n: any) => formatCurrency(Number(n) || 0, 'INR')

  return (
    <AppLayout>
      <ToastProvider />
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Intelligence That Wins — SHUBIQ Docs</p>
        </div>
        <Link href="/documents/new">
          <button className="btn btn-gold">+ New Document</button>
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          label="Total Invoiced"
          value={loading ? '...' : fmt(s.total_invoiced)}
          change="All invoices combined"
        />
        <StatCard
          label="Paid"
          value={loading ? '...' : fmt(s.total_paid)}
          change="Received payments"
        />
        <StatCard
          label="Pending"
          value={loading ? '...' : fmt(s.total_pending)}
          change="Awaiting payment"
          crimson
        />
        <StatCard
          label="Documents"
          value={loading ? '...' : String(s.total_documents || 0)}
          change={`${s.this_month || 0} this month`}
        />
      </div>

      {/* Recent documents */}
      <GlassCard
        header="Recent Documents"
        action={
          <Link href="/invoices">
            <button className="btn btn-glass btn-sm">View All</button>
          </Link>
        }
      >
        {/* Desktop table */}
        <div className="table-view table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Type</th><th>Client</th><th>Date</th><th>Amount</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text3)' }}>Loading...</td></tr>
              )}
              {!loading && docs.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text3)' }}>
                  No documents yet.{' '}
                  <Link href="/documents/new" style={{ color: 'var(--c2)' }}>Create your first →</Link>
                </td></tr>
              )}
              {docs.map((doc: any) => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{doc.number}</td>
                  <td><TypeBadge type={doc.type} /></td>
                  <td>{doc.client?.name || '—'}</td>
                  <td>{formatDate(doc.date)}</td>
                  <td style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--c2)' }}>
                    {formatCurrency(doc.total, doc.currency)}
                  </td>
                  <td><StatusBadge status={doc.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mobile-cards-view" style={{ padding: 12 }}>
          {loading && <p style={{ textAlign: 'center', color: 'var(--text3)', padding: 24 }}>Loading...</p>}
          {!loading && docs.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text3)', padding: 24 }}>No documents yet</p>
          )}
          {docs.map((doc: any) => (
            <Link key={doc.id} href={`/documents/${doc.id}`} style={{ textDecoration: 'none' }}>
              <div className="mobile-doc-card">
                <div className="mdc-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="mdc-num">{doc.number}</span>
                    <TypeBadge type={doc.type} />
                  </div>
                  <span className="mdc-amt">{formatCurrency(doc.total, doc.currency)}</span>
                </div>
                <div className="mdc-client">{doc.client?.name || '—'}</div>
                <div className="mdc-footer">
                  <StatusBadge status={doc.status} />
                  <span style={{ fontSize: 11.5, color: 'var(--text3)' }}>{formatDate(doc.date)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </GlassCard>
    </AppLayout>
  )
}
