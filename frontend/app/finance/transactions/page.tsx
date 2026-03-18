'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import AppLayout from '@/components/layout/AppLayout'
import { Transaction } from '@/types'
import { PageHeader, GlassCard } from '@/components/ui'
import NewTransactionModal from '@/components/finance/NewTransactionModal'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Filter, Download, Plus, ArrowUpRight, ArrowDownLeft, Scissors } from 'lucide-react'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    api.getTransactions().then(res => {
      setTransactions(res)
      setLoading(false)
    })
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'Income': return <ArrowDownLeft size={16} className="text-emerald-400" />
      case 'Expense': return <ArrowUpRight size={16} className="text-rose-400" />
      case 'Write-Off': return <Scissors size={16} className="text-amber-400" />
      default: return null
    }
  }

  return (
    <AppLayout>
      <div className="animate-in">
        <PageHeader 
          title="Transactions" 
          subtitle="All financial movements across your business"
          action={
            <div className="flex gap-2">
              <button className="btn btn-gold btn-sm" onClick={() => setShowNew(true)}>
                <Plus size={16} /> New Transaction
              </button>
            </div>
          }
        />

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm"
            />
          </div>
          <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none">
            <option>All Types</option>
            <option>Income</option>
            <option>Expense</option>
            <option>Write-Off</option>
          </select>
        </div>

        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b border-white/5">
                  <th className="p-4 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Details</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Category</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Account</th>
                  <th className="p-4 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Date</th>
                  <th className="p-4 text-right text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-zinc-500">Loading transactions...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No transactions recorded yet.</td></tr>
                ) : transactions.map(t => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                          {getIcon(t.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{t.description}</div>
                          <div className="text-[10px] text-zinc-500">{t.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-zinc-400 bg-white/5 px-2 py-1 rounded">
                        {t.category_name}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-zinc-400">{t.account_name}</td>
                    <td className="p-4 text-xs text-zinc-400">{formatDate(t.date)}</td>
                    <td className="p-4 text-right">
                      <div className={`font-mono text-sm ${
                        t.type === 'Income' ? 'text-emerald-400' : 
                        t.type === 'Expense' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {t.type === 'Expense' || t.type === 'Write-Off' ? '-' : '+'}
                        {formatCurrency(t.amount, 'INR')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {showNew && (
        <NewTransactionModal
          onClose={() => setShowNew(false)}
          onSuccess={(tx) => {
            setTransactions(prev => [tx, ...prev])
            setShowNew(false)
          }}
        />
      )}
    </AppLayout>
  )
}
