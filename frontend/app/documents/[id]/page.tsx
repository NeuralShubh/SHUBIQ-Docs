'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import PrintDocument from '@/components/documents/PrintDocument'
import { StatusBadge, TypeBadge, showToast, ToastProvider } from '@/components/ui'
import { api } from '@/lib/api'
import { CompanySettings } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Printer, Pencil, ArrowLeft } from 'lucide-react'

const defaultSettings: CompanySettings = {
  name: 'SHUBIQ', tagline: 'Intelligence That Wins',
  email: 'shubiqofficial@gmail.com', phone: '', website: 'https://shubiq.com',
  address: 'Pune, Maharashtra, India', gst_number: '', pan_number: '',
  invoice_prefix: 'INV-', estimate_prefix: 'EST-', receipt_prefix: 'REC-',
  invoice_counter: 1, estimate_counter: 1, receipt_counter: 1,
  default_currency: 'INR', default_tax_rate: 18, payment_due_days: 30,
  bank_name: '', account_number: '', ifsc_code: '', account_type: 'Current', upi_id: '',
  default_notes: '', default_terms: '',
}

export default function DocumentViewPage({ params }: { params: { id: string } }) {
  const [doc, setDoc] = useState<any>(null)
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getDocument(params.id), api.getSettings()])
      .then(([d, s]) => { setDoc(d); if (s) setSettings(s) })
      .catch(() => showToast('Failed to load document', 'error'))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return (
    <AppLayout>
      <div style={{ padding: 40, color: 'var(--text2)', textAlign: 'center' }}>Loading...</div>
    </AppLayout>
  )
  if (!doc) return (
    <AppLayout>
      <div style={{ padding: 40, color: 'var(--text2)', textAlign: 'center' }}>Document not found.</div>
    </AppLayout>
  )

  const client = doc.client || { name: '', company: '', email: '', phone: '', address: '', gst_number: '' }
  const printSettings = { ...settings, bank_name: doc.bank_name || settings.bank_name, account_number: doc.account_number || settings.account_number, ifsc_code: doc.ifsc_code || settings.ifsc_code, upi_id: doc.upi_id || settings.upi_id }
  const backHref = doc.type === 'Invoice' ? '/invoices' : doc.type === 'Estimate' ? '/estimates' : '/receipts'

  return (
    <>
      {/* Print only */}
      <div className="print-only">
        <PrintDocument doc={doc} client={client} settings={printSettings} />
      </div>

      {/* App view */}
      <AppLayout>
        <ToastProvider />
        <div className="no-print">
          {/* Header */}
          <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link href={backHref}>
                <button className="btn btn-glass btn-sm btn-icon"><ArrowLeft size={14} /></button>
              </Link>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h1 className="page-title" style={{ fontSize: 22 }}>{doc.number}</h1>
                  <TypeBadge type={doc.type} />
                  <StatusBadge status={doc.status} />
                </div>
                <p className="page-sub">{client.name} · {formatDate(doc.date)}</p>
              </div>
            </div>
            <div className="btn-row" style={{ display: 'flex', gap: 8 }}>
              <Link href={`/documents/${doc.id}/edit`}>
                <button className="btn btn-glass"><Pencil size={13} /> Edit</button>
              </Link>
              <button className="btn btn-gold" onClick={() => window.print()}>
                <Printer size={13} /> Print / PDF
              </button>
            </div>
          </div>

          {/* Quick info bar - mobile friendly */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20,
            background: 'var(--glass)', border: '1px solid rgba(210,159,34,0.18)',
            borderRadius: 'var(--r2)', padding: '14px 18px', backdropFilter: 'blur(16px)',
          }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 4 }}>Amount</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--c2)' }}>
                {formatCurrency(doc.total, doc.currency)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 4 }}>Date</div>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{formatDate(doc.date)}</div>
            </div>
            {doc.due_date && <div>
              <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 4 }}>Due</div>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{formatDate(doc.due_date)}</div>
            </div>}
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 4 }}>GST</div>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{formatCurrency(doc.tax_amount, doc.currency)}</div>
            </div>
          </div>

          {/* Document preview */}
          <div className="print-preview-bg">
            <PrintDocument doc={doc} client={client} settings={printSettings} />
          </div>
        </div>
      </AppLayout>
    </>
  )
}
