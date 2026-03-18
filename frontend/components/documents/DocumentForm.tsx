'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Document, DocumentType, DocumentStatus, Currency, LineItem, CompanySettings } from '@/types'
import { calculateTotals, generateDocNumber, formatCurrency } from '@/lib/utils'
import { SectionTitle, FormGroup, showToast, ToastProvider } from '@/components/ui'
import PrintDocument from './PrintDocument'
import { Printer, Save, X, Plus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'

interface Props { initialType?: DocumentType; existingDoc?: Document }

const defaultSettings: CompanySettings = {
  name: 'SHUBIQ', tagline: 'Intelligence That Wins',
  email: 'shubiqofficial@gmail.com', phone: '', website: 'https://shubiq.com',
  address: 'Miraj, Maharashtra, India', gst_number: '', pan_number: '',
  invoice_prefix: 'INV-', estimate_prefix: 'EST-', receipt_prefix: 'REC-',
  invoice_counter: 1, estimate_counter: 1, receipt_counter: 1,
  default_currency: 'INR', default_tax_rate: 18, payment_due_days: 30,
  bank_name: '', account_number: '', ifsc_code: '', account_type: 'Current', upi_id: '',
  default_notes: 'Thank you for your business. We look forward to a long-term partnership.',
  default_terms: '50% advance is required to start work, 30% at mid‑project, and the remaining 20% on final delivery. Invoices are payable within 7 days of issue. Work output remains the property of SHUBIQ until full payment is received.',
}

function newItem(): LineItem {
  return { id: Math.random().toString(36).slice(2), description: '', category: '', quantity: 1, rate: 0, amount: 0 }
}

export default function DocumentForm({ initialType = 'Invoice', existingDoc }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'details' | 'items' | 'settings' | 'preview'>('details')
  const [clients, setClients] = useState<any[]>([])
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings)
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  // Form state
  const [docType, setDocType] = useState<DocumentType>(existingDoc?.type || initialType)
  const [docNumber, setDocNumber] = useState(existingDoc?.number || '')
  const [docDate, setDocDate] = useState(existingDoc?.date?.split('T')[0] || today)
  const [docDue, setDocDue] = useState(existingDoc?.due_date?.split('T')[0] || dueDate)
  const [currency, setCurrency] = useState<Currency>(existingDoc?.currency || 'INR')
  const [status, setStatus] = useState<DocumentStatus>(existingDoc?.status || 'Draft')
  const [clientId, setClientId] = useState(existingDoc?.client_id || '')
  const [clientName, setClientName] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientGst, setClientGst] = useState('')
  const [items, setItems] = useState<LineItem[]>(
    existingDoc?.line_items?.length ? existingDoc.line_items : [newItem()]
  )
  const [taxRate, setTaxRate] = useState(existingDoc?.tax_rate ?? 18)
  const [notes, setNotes] = useState(existingDoc?.notes || defaultSettings.default_notes)
  const [terms, setTerms] = useState(existingDoc?.terms || defaultSettings.default_terms)
  const [paymentMethod, setPaymentMethod] = useState(existingDoc?.payment_method || 'Bank Transfer')
  const [bankName, setBankName] = useState(existingDoc?.bank_name || '')
  const [accountNo, setAccountNo] = useState(existingDoc?.account_number || '')
  const [ifsc, setIfsc] = useState(existingDoc?.ifsc_code || '')
  const [upi, setUpi] = useState(existingDoc?.upi_id || '')
  const [refDoc, setRefDoc] = useState(existingDoc?.ref_document || '')

  const { subtotal, taxAmount, total } = calculateTotals(items, taxRate)
  const fmt = (n: number) => formatCurrency(n, currency)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [cl, s] = await Promise.all([api.getClients(), api.getSettings()])
      setClients(cl)
      if (s) {
        setSettings(s)
        if (!existingDoc) {
          if (s.default_notes) setNotes(s.default_notes)
          if (s.default_terms) setTerms(s.default_terms)
          if (s.bank_name) setBankName(s.bank_name)
          if (s.account_number) setAccountNo(s.account_number)
          if (s.ifsc_code) setIfsc(s.ifsc_code)
          if (s.upi_id) setUpi(s.upi_id)
          if (s.default_tax_rate) setTaxRate(s.default_tax_rate)
          if (s.default_currency) setCurrency(s.default_currency)
          const prefix = initialType === 'Invoice' ? s.invoice_prefix : initialType === 'Estimate' ? s.estimate_prefix : s.receipt_prefix
          const counter = initialType === 'Invoice' ? s.invoice_counter : initialType === 'Estimate' ? s.estimate_counter : s.receipt_counter
          setDocNumber(generateDocNumber(prefix, counter))
        }
      }
      // Fill client if editing
      if (existingDoc?.client_id) {
        const c = cl.find((x: any) => x.id === existingDoc.client_id)
        if (c) fillClientFields(c)
      }
    } catch { showToast('Failed to load data', 'error') }
  }

  function fillClientFields(c: any) {
    setClientId(c.id); setClientName(c.name); setClientCompany(c.company)
    setClientEmail(c.email); setClientPhone(c.phone)
    setClientAddress(c.address); setClientGst(c.gst_number)
  }

  function changeDocType(t: DocumentType) {
    setDocType(t)
    const prefix = t === 'Invoice' ? settings.invoice_prefix : t === 'Estimate' ? settings.estimate_prefix : settings.receipt_prefix
    const counter = t === 'Invoice' ? settings.invoice_counter : t === 'Estimate' ? settings.estimate_counter : settings.receipt_counter
    setDocNumber(generateDocNumber(prefix, counter))
  }

  function updateItem(i: number, field: keyof LineItem, value: string | number) {
    const updated = [...items]
    updated[i] = { ...updated[i], [field]: value }
    updated[i].amount = updated[i].quantity * updated[i].rate
    setItems(updated)
  }

  async function save() {
    if (!docNumber) return showToast('Document number is required', 'error')
    setSaving(true)
    try {
      const payload = {
        type: docType, number: docNumber, date: docDate, due_date: docDue,
        status, currency, client_id: clientId || null,
        line_items: items, subtotal, tax_rate: taxRate, tax_amount: taxAmount, total,
        notes, terms, payment_method: paymentMethod,
        bank_name: bankName, account_number: accountNo, ifsc_code: ifsc, upi_id: upi,
        ref_document: refDoc,
      }
      if (existingDoc) {
        await api.updateDocument(existingDoc.id, payload)
        showToast('Document updated!', 'success')
      } else {
        await api.createDocument(payload)
        showToast('Document saved!', 'success')
      }
      setTimeout(() => {
        router.push(docType === 'Invoice' ? '/invoices' : docType === 'Estimate' ? '/estimates' : '/receipts')
      }, 600)
    } catch (e: any) {
      showToast(e.message || 'Failed to save', 'error')
    } finally { setSaving(false) }
  }

  // Build preview objects
  const previewDoc: Document = {
    id: '', type: docType, number: docNumber, date: docDate, due_date: docDue,
    status, currency, client_id: clientId, line_items: items,
    subtotal, tax_rate: taxRate, tax_amount: taxAmount, total,
    notes, terms, payment_method: paymentMethod as any,
    bank_name: bankName, account_number: accountNo, ifsc_code: ifsc, upi_id: upi,
    ref_document: refDoc, created_at: '', updated_at: '',
  }
  const previewClient = { name: clientName, company: clientCompany, email: clientEmail, phone: clientPhone, address: clientAddress, gst_number: clientGst }
  const previewSettings = { ...settings, bank_name: bankName, account_number: accountNo, ifsc_code: ifsc, upi_id: upi }

  return (
    <AppLayout>
      <ToastProvider />
      <div className="no-print">
        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href={docType === 'Invoice' ? '/invoices' : docType === 'Estimate' ? '/estimates' : '/receipts'}>
              <button className="btn btn-glass btn-sm btn-icon"><ArrowLeft size={14} /></button>
            </Link>
            <div>
              <h1 className="page-title">{existingDoc ? `Edit ${docType}` : `New ${docType}`}</h1>
              <p className="page-sub">Fill in the details to generate a premium document</p>
            </div>
          </div>
          <div className="btn-row" style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-glass" onClick={() => setTab('preview')}>
              <Printer size={14} /> Preview
            </button>
            <button className="btn btn-gold" onClick={save} disabled={saving}>
              <Save size={14} />{saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-row">
          {(['details', 'items', 'settings', 'preview'] as const).map(t => (
            <button
              key={t}
              className={`tab-btn${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {/* DETAILS TAB */}
        {tab === 'details' && (
          <div className="two-col">
            <div>
              <SectionTitle>Document Info</SectionTitle>
              <div className="form-grid">
                <FormGroup label="Type">
                  <select value={docType} onChange={e => changeDocType(e.target.value as DocumentType)}>
                    <option>Invoice</option><option>Estimate</option><option>Receipt</option>
                  </select>
                </FormGroup>
                <FormGroup label="Number">
                  <input value={docNumber} onChange={e => setDocNumber(e.target.value)} />
                </FormGroup>
                <FormGroup label="Date">
                  <input type="date" value={docDate} onChange={e => setDocDate(e.target.value)} />
                </FormGroup>
                <FormGroup label={docType === 'Estimate' ? 'Valid Until' : 'Due Date'}>
                  <input type="date" value={docDue} onChange={e => setDocDue(e.target.value)} />
                </FormGroup>
                <FormGroup label="Currency">
                  <select value={currency} onChange={e => setCurrency(e.target.value as Currency)}>
                    <option value="INR">₹ INR</option>
                    <option value="USD">$ USD</option>
                  </select>
                </FormGroup>
                <FormGroup label="Status">
                  <select value={status} onChange={e => setStatus(e.target.value as DocumentStatus)}>
                    <option>Draft</option><option>Unpaid</option><option>Paid</option><option>Cancelled</option>
                  </select>
                </FormGroup>
                {docType === 'Receipt' && (
                  <FormGroup label="Reference Invoice" full>
                    <input value={refDoc} onChange={e => setRefDoc(e.target.value)} placeholder="INV-001" />
                  </FormGroup>
                )}
              </div>
            </div>
            <div>
              <SectionTitle>Bill To</SectionTitle>
              <div className="form-grid">
                <FormGroup label="Select Client" full>
                  <select value={clientId} onChange={e => {
                    const c = clients.find(x => x.id === e.target.value)
                    if (c) fillClientFields(c); else setClientId(e.target.value)
                  }}>
                    <option value="">Select saved client...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
                    ))}
                  </select>
                </FormGroup>
                <FormGroup label="Name">
                  <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client name" />
                </FormGroup>
                <FormGroup label="Company">
                  <input value={clientCompany} onChange={e => setClientCompany(e.target.value)} placeholder="Company" />
                </FormGroup>
                <FormGroup label="Email">
                  <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="email@co.com" />
                </FormGroup>
                <FormGroup label="Phone">
                  <input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+91 99999 99999" />
                </FormGroup>
                <FormGroup label="Address" full>
                  <textarea value={clientAddress} onChange={e => setClientAddress(e.target.value)} rows={2} placeholder="Billing address" />
                </FormGroup>
                <FormGroup label="GST Number">
                  <input value={clientGst} onChange={e => setClientGst(e.target.value)} placeholder="22AAAAA0000A1Z5" />
                </FormGroup>
              </div>
            </div>
          </div>
        )}

        {/* ITEMS TAB */}
        {tab === 'items' && (
          <div>
            <SectionTitle>Line Items</SectionTitle>
            <div className="table-scroll">
              <table className="items-table">
                <thead>
                  <tr>
                    {['Description','Category','Qty','Rate','Amount',''].map((h,i) => (
                      <th key={i} style={{ textAlign: i >= 2 && i < 5 ? 'right' : 'left', width: i===5?'40px':i===2?'10%':i===3||i===4?'15%':i===1?'18%':'auto' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id}>
                      <td>
                        <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Description" />
                      </td>
                      <td>
                        <input value={item.category} onChange={e => updateItem(i, 'category', e.target.value)} placeholder="Category" />
                      </td>
                      <td>
                        <input type="number" min={1} value={item.quantity} onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value)||0)} style={{ textAlign: 'right' }} />
                      </td>
                      <td>
                        <input type="number" min={0} value={item.rate} onChange={e => updateItem(i, 'rate', parseFloat(e.target.value)||0)} style={{ textAlign: 'right' }} />
                      </td>
                      <td style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--c2)', textAlign: 'right', padding: '7px 12px' }}>
                        {fmt(item.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button onClick={() => setItems(items.filter((_, j) => j !== i))} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn btn-glass btn-sm" style={{ marginTop: 12 }} onClick={() => setItems([...items, newItem()])}>
              <Plus size={13} /> Add Item
            </button>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <div className="totals-box" style={{ width: '100%', maxWidth: 300 }}>
                <div className="total-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div className="total-row" style={{ alignItems: 'center', gap: 10 }}>
                  <span>GST</span>
                  <select value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value))} style={{ width: 80, padding: '3px 8px', fontSize: 12, borderRadius: 6, minHeight: 'unset' }}>
                    <option value={0}>None</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                  <span style={{ marginLeft: 'auto' }}>{fmt(taxAmount)}</span>
                </div>
                <div className="total-row grand"><span>Total</span><span>{fmt(total)}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <div className="two-col">
            <div>
              <SectionTitle>Document Settings</SectionTitle>
              <div className="form-grid">
                <FormGroup label="Notes / Remarks" full>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
                </FormGroup>
                <FormGroup label="Terms & Conditions" full>
                  <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={4} />
                </FormGroup>
                <FormGroup label="Payment Method">
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    <option>Bank Transfer</option><option>UPI</option><option>Credit Card</option><option>Cash</option><option>Cheque</option>
                  </select>
                </FormGroup>
              </div>
            </div>
            <div>
              <SectionTitle>Bank Details</SectionTitle>
              <div className="form-grid">
                <FormGroup label="Bank Name" full><input value={bankName} onChange={e => setBankName(e.target.value)} /></FormGroup>
                <FormGroup label="Account No."><input value={accountNo} onChange={e => setAccountNo(e.target.value)} /></FormGroup>
                <FormGroup label="IFSC Code"><input value={ifsc} onChange={e => setIfsc(e.target.value)} /></FormGroup>
                <FormGroup label="UPI ID" full><input value={upi} onChange={e => setUpi(e.target.value)} placeholder="shubiq@hdfc" /></FormGroup>
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW TAB */}
        {tab === 'preview' && (
          <div>
            <div className="btn-row" style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <button className="btn btn-gold" onClick={() => window.print()}>
                <Printer size={14} /> Print / Save as PDF
              </button>
            </div>
            <div className="print-preview-bg">
              <PrintDocument doc={previewDoc} client={previewClient} settings={previewSettings} />
            </div>
          </div>
        )}
      </div>

      {/* Print-only layer */}
      <div className="print-only">
        <PrintDocument doc={previewDoc} client={previewClient} settings={previewSettings} />
      </div>
    </AppLayout>
  )
}
