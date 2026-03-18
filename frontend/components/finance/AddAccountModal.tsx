'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { GlassCard, FormGroup, showToast, ToastProvider } from '@/components/ui'
import { X, Check, Save } from 'lucide-react'

interface Props {
  onClose: () => void
  onSuccess: (acct: any) => void
}

export default function AddAccountModal({ onClose, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [bankName, setBankName] = useState('')
  const [type, setType] = useState('Bank Account')
  const [balance, setBalance] = useState('0')
  const [currency, setCurrency] = useState('INR')
  const [accountNumber, setAccountNumber] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.createBankAccount({
        name,
        bank_name: bankName,
        type,
        balance: parseFloat(balance),
        currency,
        account_number: accountNumber,
        is_default: isDefault
      })
      showToast('Account added successfully', 'success')
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
          header="Add Bank Account" 
          action={<button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={18} /></button>}
        >
          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
            <FormGroup label="Account Nickname" full>
              <input 
                placeholder="e.g. HDFC Primary"
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </FormGroup>

            <FormGroup label="Bank Name">
              <input 
                placeholder="e.g. HDFC Bank"
                value={bankName} 
                onChange={e => setBankName(e.target.value)} 
              />
            </FormGroup>

            <FormGroup label="Type">
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="Bank Account">Bank Account</option>
                <option value="Savings Account">Savings Account</option>
                <option value="Cash / Wallet">Cash / Wallet</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </FormGroup>

            <FormGroup label="Initial Balance">
              <input 
                type="number" 
                step="0.01"
                value={balance} 
                onChange={e => setBalance(e.target.value)} 
                required 
              />
            </FormGroup>

            <FormGroup label="Currency">
              <select value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </FormGroup>

            <FormGroup label="Account Number" full>
              <input 
                placeholder="•••• •••• •••• 1234"
                value={accountNumber} 
                onChange={e => setAccountNumber(e.target.value)} 
              />
            </FormGroup>

            <div className="col-span-2 flex items-center gap-3 py-2">
              <input 
                type="checkbox" 
                checked={isDefault} 
                onChange={e => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded bg-white/5 border-white/10"
              />
              <span className="text-sm text-zinc-400">Set as default account for transactions</span>
            </div>

            <div className="col-span-2 flex gap-3 mt-4">
              <button type="button" onClick={onClose} className="btn btn-glass flex-1">Cancel</button>
              <button type="submit" disabled={submitting} className="btn btn-gold flex-1">
                {submitting ? 'Saving...' : 'Add Account'}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
