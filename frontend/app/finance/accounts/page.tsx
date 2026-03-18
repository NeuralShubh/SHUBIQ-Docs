'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import AppLayout from '@/components/layout/AppLayout'
import { BankAccount } from '@/types'
import { PageHeader, GlassCard, ToastProvider } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { Landmark, Plus, Edit2, CreditCard, Wallet } from 'lucide-react'
import AddAccountModal from '@/components/finance/AddAccountModal'
import AccountDetailsModal from '@/components/finance/AccountDetailsModal'

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selected, setSelected] = useState<BankAccount | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    api.getBankAccounts().then(res => {
      setAccounts(res)
      setLoading(false)
    })
  }

  const getIcon = (type: string) => {
    if (type.toLowerCase().includes('bank')) return <Landmark size={20} className="text-zinc-500" />
    if (type.toLowerCase().includes('card')) return <CreditCard size={20} className="text-zinc-500" />
    return <Wallet size={20} className="text-zinc-500" />
  }

  return (
    <AppLayout>
      <ToastProvider />
      <div className="animate-in">
        <PageHeader 
          title="Bank Accounts" 
          subtitle="Manage your business bank accounts and cash balances"
          action={
            <button onClick={() => setShowAddModal(true)} className="btn btn-gold btn-sm"><Plus size={16} /> Add Account</button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="p-8 text-zinc-500">Loading accounts...</div>
          ) : accounts.map(acct => (
            <GlassCard key={acct.id}>
              <button
                className="w-full text-left p-5 flex flex-col h-full hover:bg-white/[0.02] transition-colors rounded-[16px]"
                onClick={() => setSelected(acct)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    {getIcon(acct.type)}
                  </div>
                  <button
                    className="p-1.5 hover:bg-white/5 rounded-md transition-colors text-zinc-500 hover:text-white"
                    onClick={(e) => { e.stopPropagation(); setSelected(acct) }}
                  >
                    <Edit2 size={14} />
                  </button>
                </div>

                <div className="flex-1">
                  <div className="text-sm font-semibold text-white/90 truncate">{acct.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-4">
                    {acct.bank_name || acct.type}
                  </div>
                  
                  {acct.account_number && (
                    <div className="text-[11px] font-mono text-zinc-400 bg-black/20 p-2 rounded border border-white/5 mb-4">
                      •••• {acct.account_number.slice(-4)}
                    </div>
                  )}

                  <div className="text-2xl font-display text-white mt-auto">
                    {formatCurrency(acct.balance, acct.currency)}
                  </div>
                </div>
              </button>
            </GlassCard>
          ))}
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold/10 group-hover:text-gold transition-colors">
              <Plus size={24} />
            </div>
            <div className="text-sm font-medium text-zinc-500 group-hover:text-white">Add New Account</div>
          </button>
        </div>

        {showAddModal && <AddAccountModal onClose={() => setShowAddModal(false)} onSuccess={load} />}
        {selected && (
          <AccountDetailsModal
            account={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </AppLayout>
  )
}
