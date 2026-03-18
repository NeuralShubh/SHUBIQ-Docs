'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Document, BankAccount, Category } from '@/types'
import { GlassCard, FormGroup, showToast } from '@/components/ui'
import { X, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Props {
  doc: Document
  onClose: () => void
  onSuccess: (updated: Document) => void
}

export default function RecordPaymentModal({ doc, onClose, onSuccess }: Props) {
  const [amountPaid, setAmountPaid] = useState<string>(Math.max(0, doc.total - doc.paid_amount - doc.discount_amount).toString())
  const [discount, setDiscount] = useState<string>('0')
  const [accountId, setAccountId] = useState<string>('')
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState<string>(`Payment for ${doc.number}`)
  const [categoryId, setCategoryId] = useState<string>('')
  
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.getBankAccounts().then(setAccounts)
    api.getCategories('Income').then(cats => {
      setCategories(cats)
      const sales = cats.find(c => c.name.toLowerCase().includes('sales'))
      if (sales) setCategoryId(sales.id)
    })
  }, [])

  useEffect(() => {
    const def = accounts.find(a => a.is_default) || accounts[0]
    if (def) setAccountId(def.id)
  }, [accounts])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.recordPayment(doc.id, {
        amountPaid: parseFloat(amountPaid),
        discount: parseFloat(discount),
        accountId,
        date,
        description,
        categoryId
      })
      showToast('Payment recorded successfully', 'success')
      onSuccess(res)
      onClose()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const remaining = Math.max(0, doc.total - doc.paid_amount - doc.discount_amount)
  const isClosing = (parseFloat(amountPaid) || 0) + (parseFloat(discount) || 0) >= remaining

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md">
        <GlassCard 
          header="Record Payment" 
          action={<button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={18} /></button>}
        >
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-2">
              <div className="text-[10px] uppercase tracking-wider text-amber-500/70 font-bold">Balance Due</div>
              <div className="text-xl font-semibold text-amber-500">{formatCurrency(remaining, doc.currency)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Amount Paid">
                <input 
                  type="number" 
                  step="0.01"
                  value={amountPaid} 
                  onChange={e => setAmountPaid(e.target.value)} 
                  required 
                  className="bg-white/5 border-white/10"
                />
              </FormGroup>
              <FormGroup label="Write-off / Discount">
                <input 
                  type="number" 
                  step="0.01"
                  value={discount} 
                  onChange={e => setDiscount(e.target.value)} 
                  className="bg-white/5 border-white/10 text-rose-400"
                />
              </FormGroup>
            </div>

            <FormGroup label="Bank Account">
              <select value={accountId} onChange={e => setAccountId(e.target.value)} required>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance, a.currency)})</option>)}
              </select>
            </FormGroup>

            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Payment Date">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </FormGroup>
              <FormGroup label="Income Category">
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormGroup>
            </div>

            <FormGroup label="Description">
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} />
            </FormGroup>

            {isClosing && (
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-400/10 p-2 rounded-md border border-emerald-400/20">
                <Check size={14} /> This payment will close the invoice.
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onClose} className="btn btn-glass flex-1">Cancel</button>
              <button type="submit" disabled={submitting} className="btn btn-gold flex-1">
                {submitting ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
