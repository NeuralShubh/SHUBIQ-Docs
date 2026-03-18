'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { GlassCard, FormGroup, showToast, ToastProvider } from '@/components/ui'
import { X, Check, Save } from 'lucide-react'
import { BankAccount, Category } from '@/types'

interface Props {
  onClose: () => void
  onSuccess: (tx: any) => void
}

export default function NewTransactionModal({ onClose, onSuccess }: Props) {
  const [type, setType] = useState('Expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    Promise.all([
      api.getBankAccounts(),
      api.getCategories(type as 'Income' | 'Expense')
    ]).then(([accts, cats]) => {
      setAccounts(accts)
      setCategories(cats)
      
      const def = accts.find(a => a.is_default) || accts[0]
      if (def) setAccountId(def.id)
      
      if (cats.length > 0) setCategoryId(cats[0].id)
    })
  }, [type])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.createTransaction({
        type,
        amount: parseFloat(amount),
        description,
        date,
        account_id: accountId,
        category_id: categoryId
      })
      showToast('Transaction recorded', 'success')
      onSuccess(res)
      onClose()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg">
        <GlassCard 
          header="New Transaction" 
          action={<button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={18} /></button>}
        >
          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
            <FormGroup label="Transaction Type" full>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button 
                  type="button"
                  onClick={() => setType('Expense')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'Expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  EXPENSE
                </button>
                <button 
                   type="button"
                   onClick={() => setType('Income')}
                   className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'Income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  INCOME
                </button>
              </div>
            </FormGroup>

            <FormGroup label="Amount">
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                required 
                className="text-xl font-display"
              />
            </FormGroup>

            <FormGroup label="Date">
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </FormGroup>

            <FormGroup label="Bank Account">
              <select value={accountId} onChange={e => setAccountId(e.target.value)} required>
                <option value="">Select Account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </FormGroup>

            <FormGroup label="Category">
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormGroup>

            <FormGroup label="Description" full>
              <input 
                placeholder="e.g. Office Supplies, Rent, Client Payment"
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                required 
              />
            </FormGroup>

            <div className="col-span-2 flex gap-3 mt-4">
              <button type="button" onClick={onClose} className="btn btn-glass flex-1">Cancel</button>
              <button type="submit" disabled={submitting} className={`btn flex-1 ${type === 'Income' ? 'btn-gold' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'}`}>
                {submitting ? 'Recording...' : `Record ${type}`}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
