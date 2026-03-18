'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import PrintDocument from '@/components/documents/PrintDocument'
import RecordPaymentModal from '@/components/documents/RecordPaymentModal'
import { StatusBadge, TypeBadge, showToast, ToastProvider } from '@/components/ui'
import { api } from '@/lib/api'
import { CompanySettings } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Printer, Pencil, ArrowLeft } from 'lucide-react'

const defaultSettings: CompanySettings = {
  name: 'SHUBIQ', tagline: 'Intelligence That Wins',
  email: 'shubiqofficial@gmail.com', phone: '', website: 'https://shubiq.com',
  address: 'Miraj, Maharashtra, India', gst_number: '', pan_number: '',
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
  const [showPaymentModal, setShowPaymentModal] = useState(false)

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
  
  const balance = Math.max(0, doc.total - doc.paid_amount - doc.discount_amount)
  const showPaymentBtn = doc.type === 'Invoice' && doc.status !== 'Paid' && doc.status !== 'Closed' && doc.status !== 'Cancelled'

  return (
    <>
      {/* Print only */}
      <div className="print-only">
        <PrintDocument doc={doc} client={client} settings={printSettings} />
      </div>

      {/* App view */}
      <AppLayout>
        <ToastProvider />
        {showPaymentModal && (
          <RecordPaymentModal 
            doc={doc} 
            onClose={() => setShowPaymentModal(false)} 
            onSuccess={(updated) => setDoc(updated)}
          />
        )}
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
              {showPaymentBtn && (
                <button className="btn btn-gold" onClick={() => setShowPaymentModal(true)}>
                  Record Payment
                </button>
              )}
              <Link href={`/documents/${doc.id}/edit`}>
                <button className="btn btn-glass"><Pencil size={13} /> Edit</button>
              </Link>
              <button className="btn btn-glass" onClick={() => window.print()}>
                <Printer size={13} /> Print/PDF
              </button>
            </div>
          </div>

          {/* Quick info bar - updated for Finance */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 24, marginBottom: 20,
            background: 'var(--glass)', border: '1px solid rgba(210,159,34,0.18)',
            borderRadius: 'var(--r2)', padding: '20px 24px', backdropFilter: 'blur(16px)',
          }}>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Total Amount</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text)' }}>
                  {formatCurrency(doc.total, doc.currency)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Paid</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: '#4ade80' }}>
                  {formatCurrency(doc.paid_amount, doc.currency)}
                </div>
              </div>
              {doc.discount_amount > 0 && <div>
                <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Discounted</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: '#f87171' }}>
                  {formatCurrency(doc.discount_amount, doc.currency)}
                </div>
              </div>}
              <div>
                <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Balance Due</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--c2)' }}>
                  {formatCurrency(balance, doc.currency)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 24 }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Date</div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>{formatDate(doc.date)}</div>
              </div>
              {doc.due_date && <div>
                <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Due Date</div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>{formatDate(doc.due_date)}</div>
              </div>}
            </div>
          </div>

          {/* Document preview */}
          <div className="print-preview-bg" style={{ marginTop: 10 }}>
            <PrintDocument doc={doc} client={client} settings={printSettings} />
          </div>
        </div>
      </AppLayout>

    </>
  )
}
