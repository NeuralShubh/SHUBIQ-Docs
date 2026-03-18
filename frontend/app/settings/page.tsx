'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { PageHeader, SectionTitle, FormGroup, showToast, ToastProvider } from '@/components/ui'
import { api } from '@/lib/api'
import { CompanySettings } from '@/types'
import { Save, Check } from 'lucide-react'

const defaults: CompanySettings = {
  name: 'SHUBIQ', tagline: 'Intelligence That Wins',
  email: 'shubiqofficial@gmail.com', phone: '', website: 'https://shubiq.com',
  address: 'Pune, Maharashtra, India', gst_number: '', pan_number: '',
  invoice_prefix: 'INV-', estimate_prefix: 'EST-', receipt_prefix: 'REC-',
  invoice_counter: 1, estimate_counter: 1, receipt_counter: 1,
  default_currency: 'INR', default_tax_rate: 18, payment_due_days: 30,
  bank_name: '', account_number: '', ifsc_code: '', account_type: 'Current', upi_id: '',
  default_notes: 'Thank you for your business. We look forward to a long-term partnership.',
  default_terms: 'Payment is due within 30 days of invoice date. Late payments may incur a 2% monthly interest charge. All work remains property of SHUBIQ until full payment is received.',
}

export default function SettingsPage() {
  const [form, setForm] = useState<CompanySettings>(defaults)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.getSettings()
      .then(s => { if (s) setForm({ ...defaults, ...s }) })
      .catch(() => {})
  }, [])

  const set = (k: keyof CompanySettings, v: any) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    setSaving(true)
    try {
      await api.updateSettings(form)
      setSaved(true)
      showToast('Settings saved!', 'success')
      setTimeout(() => setSaved(false), 2500)
    } catch { showToast('Failed to save settings', 'error') }
    finally { setSaving(false) }
  }

  return (
    <AppLayout>
      <ToastProvider />
      <PageHeader
        title="Settings"
        subtitle="Configure your SHUBIQ Docs workspace"
        action={
          <button className="btn btn-gold" onClick={save} disabled={saving}>
            {saved ? <><Check size={13} /> Saved!</> : <><Save size={13} /> {saving ? 'Saving...' : 'Save Changes'}</>}
          </button>
        }
      />

      <div className="two-col">
        {/* Company Profile */}
        <div>
          <SectionTitle>Company Profile</SectionTitle>
          <div className="form-grid">
            <FormGroup label="Company Name" full>
              <input value={form.name} onChange={e => set('name', e.target.value)} />
            </FormGroup>
            <FormGroup label="Tagline" full>
              <input value={form.tagline} onChange={e => set('tagline', e.target.value)} />
            </FormGroup>
            <FormGroup label="Email">
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </FormGroup>
            <FormGroup label="Phone">
              <input value={form.phone} onChange={e => set('phone', e.target.value)} />
            </FormGroup>
            <FormGroup label="Website" full>
              <input value={form.website} onChange={e => set('website', e.target.value)} />
            </FormGroup>
            <FormGroup label="Address" full>
              <textarea value={form.address} onChange={e => set('address', e.target.value)} rows={2} />
            </FormGroup>
            <FormGroup label="GST Number">
              <input value={form.gst_number} onChange={e => set('gst_number', e.target.value)} placeholder="Your GSTIN" />
            </FormGroup>
            <FormGroup label="PAN Number">
              <input value={form.pan_number} onChange={e => set('pan_number', e.target.value)} placeholder="Your PAN" />
            </FormGroup>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Document Defaults */}
          <div>
            <SectionTitle>Document Defaults</SectionTitle>
            <div className="form-grid">
              <FormGroup label="Default Currency">
                <select value={form.default_currency} onChange={e => set('default_currency', e.target.value)}>
                  <option value="INR">₹ INR — Indian Rupee</option>
                  <option value="USD">$ USD — US Dollar</option>
                </select>
              </FormGroup>
              <FormGroup label="Default GST Rate">
                <select value={form.default_tax_rate} onChange={e => set('default_tax_rate', parseFloat(e.target.value))}>
                  <option value={0}>None (0%)</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </FormGroup>
              <FormGroup label="Invoice Prefix">
                <input value={form.invoice_prefix} onChange={e => set('invoice_prefix', e.target.value)} />
              </FormGroup>
              <FormGroup label="Start Invoice #">
                <input type="number" value={form.invoice_counter} onChange={e => set('invoice_counter', parseInt(e.target.value))} />
              </FormGroup>
              <FormGroup label="Estimate Prefix">
                <input value={form.estimate_prefix} onChange={e => set('estimate_prefix', e.target.value)} />
              </FormGroup>
              <FormGroup label="Receipt Prefix">
                <input value={form.receipt_prefix} onChange={e => set('receipt_prefix', e.target.value)} />
              </FormGroup>
              <FormGroup label="Payment Due (days)" full>
                <input type="number" value={form.payment_due_days} onChange={e => set('payment_due_days', parseInt(e.target.value))} />
              </FormGroup>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <SectionTitle>Bank Details</SectionTitle>
            <div className="form-grid">
              <FormGroup label="Bank Name" full>
                <input value={form.bank_name} onChange={e => set('bank_name', e.target.value)} placeholder="HDFC Bank" />
              </FormGroup>
              <FormGroup label="Account Number">
                <input value={form.account_number} onChange={e => set('account_number', e.target.value)} />
              </FormGroup>
              <FormGroup label="IFSC Code">
                <input value={form.ifsc_code} onChange={e => set('ifsc_code', e.target.value)} />
              </FormGroup>
              <FormGroup label="Account Type" full>
                <select value={form.account_type} onChange={e => set('account_type', e.target.value)}>
                  <option>Current</option><option>Savings</option>
                </select>
              </FormGroup>
              <FormGroup label="UPI ID" full>
                <input value={form.upi_id} onChange={e => set('upi_id', e.target.value)} placeholder="shubiq@hdfc" />
              </FormGroup>
            </div>
          </div>
        </div>
      </div>

      {/* Default Text */}
      <div className="two-col" style={{ marginTop: 28 }}>
        <div>
          <SectionTitle>Default Notes</SectionTitle>
          <textarea value={form.default_notes} onChange={e => set('default_notes', e.target.value)} rows={4} style={{ width: '100%' }} />
        </div>
        <div>
          <SectionTitle>Default Terms & Conditions</SectionTitle>
          <textarea value={form.default_terms} onChange={e => set('default_terms', e.target.value)} rows={4} style={{ width: '100%' }} />
        </div>
      </div>

      {/* Mobile save button (sticky bottom) */}
      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
        <button className="btn btn-gold btn-full" onClick={save} disabled={saving} style={{ maxWidth: 400 }}>
          {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save All Settings'}</>}
        </button>
      </div>
    </AppLayout>
  )
}
