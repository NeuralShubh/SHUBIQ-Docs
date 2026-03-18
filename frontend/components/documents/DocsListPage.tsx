'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import { PageHeader, GlassCard, StatusBadge, TypeBadge, EmptyRow, showToast, ToastProvider } from '@/components/ui'
import { api } from '@/lib/api'
import { Document, DocumentType } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Pencil, Trash2, Eye } from 'lucide-react'

interface Props {
  type?: DocumentType
  title: string
  subtitle: string
}

const STATUSES = ['All', 'Draft', 'Unpaid', 'Paid', 'Cancelled']

export default function DocsListPage({ type, title, subtitle }: Props) {
  const [docs, setDocs] = useState<Document[]>([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const data = await api.getDocuments(type ? { type } : {})
      setDocs(data)
    } catch { showToast('Failed to load documents', 'error') }
    finally { setLoading(false) }
  }

  async function del(id: string) {
    if (!confirm('Delete this document? This cannot be undone.')) return
    try {
      await api.deleteDocument(id)
      setDocs(d => d.filter(x => x.id !== id))
      showToast('Document deleted', 'success')
    } catch { showToast('Failed to delete', 'error') }
  }

  const filtered = filter === 'All' ? docs : docs.filter(d => d.status === filter)
  const newHref = `/documents/new${type ? `?type=${type}` : ''}`

  return (
    <AppLayout>
      <ToastProvider />
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          <Link href={newHref}>
            <button className="btn btn-gold">+ New {type || 'Document'}</button>
          </Link>
        }
      />

      {/* Filter pills */}
      <div className="filter-row">
        {STATUSES.map(s => (
          <button
            key={s}
            className={`filter-pill${filter === s ? ' active' : ''}`}
            onClick={() => setFilter(s)}
          >{s}</button>
        ))}
      </div>

      <GlassCard>
        {/* Desktop table */}
        <div className="table-view table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                {!type && <th>Type</th>}
                <th>Client</th>
                <th>Date</th>
                <th>{type === 'Estimate' ? 'Valid Until' : type === 'Receipt' ? 'Ref Invoice' : 'Due Date'}</th>
                <th>Amount</th>
                {type !== 'Receipt' && <th>Status</th>}
                {type === 'Receipt' && <th>Method</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <EmptyRow cols={8} message="Loading..." />}
              {!loading && filtered.length === 0 && <EmptyRow cols={8} message={`No ${filter === 'All' ? '' : filter + ' '}documents found`} />}
              {!loading && filtered.map(doc => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{doc.number}</td>
                  {!type && <td><TypeBadge type={doc.type} /></td>}
                  <td>{(doc as any).client?.name || '—'}</td>
                  <td>{formatDate(doc.date)}</td>
                  <td>
                    {type === 'Receipt'
                      ? doc.ref_document || '—'
                      : doc.due_date ? formatDate(doc.due_date) : '—'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--c2)' }}>
                    {formatCurrency(doc.total, doc.currency)}
                  </td>
                  {type !== 'Receipt' && <td><StatusBadge status={doc.status} /></td>}
                  {type === 'Receipt' && <td>{doc.payment_method || '—'}</td>}
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/documents/${doc.id}`}>
                        <button className="btn btn-glass btn-sm btn-icon" title="View"><Eye size={13} /></button>
                      </Link>
                      <Link href={`/documents/${doc.id}/edit`}>
                        <button className="btn btn-glass btn-sm btn-icon" title="Edit"><Pencil size={13} /></button>
                      </Link>
                      <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => del(doc.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mobile-cards-view" style={{ padding: 12 }}>
          {loading && <p style={{ textAlign: 'center', color: 'var(--text3)', padding: 24 }}>Loading...</p>}
          {!loading && filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text3)', padding: 24 }}>No documents found</p>
          )}
          {!loading && filtered.map(doc => (
            <div key={doc.id} className="mobile-doc-card">
              <div className="mdc-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="mdc-num">{doc.number}</span>
                  {!type && <TypeBadge type={doc.type} />}
                </div>
                <span className="mdc-amt">{formatCurrency(doc.total, doc.currency)}</span>
              </div>
              <div className="mdc-client">{(doc as any).client?.name || '—'}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text3)' }}>
                {formatDate(doc.date)}
                {doc.due_date && ` · Due: ${formatDate(doc.due_date)}`}
              </div>
              <div className="mdc-footer">
                <StatusBadge status={doc.status} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/documents/${doc.id}`}>
                    <button className="btn btn-glass btn-sm" style={{ padding: '5px 12px', fontSize: 11.5 }}>View</button>
                  </Link>
                  <Link href={`/documents/${doc.id}/edit`}>
                    <button className="btn btn-glass btn-sm btn-icon"><Pencil size={12} /></button>
                  </Link>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(doc.id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </AppLayout>
  )
}
