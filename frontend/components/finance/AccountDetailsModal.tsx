'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { BankAccount, Transaction } from '@/types'
import { GlassCard, showToast } from '@/components/ui'
import { X, ArrowDownLeft, ArrowUpRight, Scissors } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props {
  account: BankAccount
  onClose: () => void
}

export default function AccountDetailsModal({ account, onClose }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTransactions({ account_id: account.id, limit: 20 })
      .then(setTransactions)
      .catch((err: any) => showToast(err.message || 'Failed to load transactions', 'error'))
      .finally(() => setLoading(false))
  }, [account.id])

  const iconFor = (type: string) => {
    if (type === 'Income') return <ArrowDownLeft size={14} className="text-emerald-400" />
    if (type === 'Expense') return <ArrowUpRight size={14} className="text-rose-400" />
    if (type === 'Write-Off') return <Scissors size={14} className="text-amber-400" />
    return null
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl">
        <GlassCard
          header={
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-white/90">{account.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                {account.bank_name || account.type}
              </div>
            </div>
          }
          action={
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={18} />
            </button>
          }
        >
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Balance</div>
                <div className="text-lg font-semibold text-amber-400">
                  {formatCurrency(account.balance, account.currency)}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Account No.</div>
                <div className="text-sm text-white/80 font-mono">
                  {account.account_number ? `•••• ${account.account_number.slice(-4)}` : '—'}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Currency</div>
                <div className="text-sm text-white/80">{account.currency}</div>
              </div>
            </div>

            <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-2">Recent Transactions</div>
            <div className="border border-white/5 rounded-xl overflow-hidden">
              {loading ? (
                <div className="p-6 text-center text-zinc-500">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="p-6 text-center text-zinc-500">No transactions for this account yet.</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {transactions.map(t => (
                    <div key={t.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                          {iconFor(t.type)}
                        </div>
                        <div>
                          <div className="text-sm text-white/90">{t.description}</div>
                          <div className="text-[10px] text-zinc-500">{formatDate(t.date)}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-mono ${
                        t.type === 'Income' ? 'text-emerald-400' :
                        t.type === 'Expense' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {t.type === 'Expense' || t.type === 'Write-Off' ? '-' : '+'}
                        {formatCurrency(t.amount, account.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
