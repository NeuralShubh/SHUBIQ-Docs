'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import AppLayout from '@/components/layout/AppLayout'
import { FinancialSummary, BankAccount } from '@/types'
import { PageHeader, StatCard, GlassCard, Amount, SectionTitle } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Landmark, Wallet, Plus, ArrowRightLeft } from 'lucide-react'

export default function FinancePage() {
  const [data, setData] = useState<FinancialSummary | null>(null)
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getFinanceStats(),
      api.getBankAccounts()
    ]).then(([stats, accts]) => {
      setData(stats)
      setAccounts(accts)
      setLoading(false)
    })
  }, [])

  if (loading || !data) return (
    <AppLayout>
      <div className="p-8 text-zinc-500">Loading financials...</div>
    </AppLayout>
  )

  // Calculate max for chart scaling
  const maxVal = Math.max(...data.cashflow.map(m => Math.max(m.income, m.expense)), 1000)

  return (
    <AppLayout>
      <div className="animate-in">
        <PageHeader 
          title="Financial Overview" 
          subtitle="Track your cashflow, profit & loss, and bank balances"
          action={
            <div className="flex gap-2">
              <button className="btn btn-glass btn-sm"><Plus size={16} /> New Transaction</button>
              <button className="btn btn-gold btn-sm"><ArrowRightLeft size={16} /> Transfer</button>
            </div>
          }
        />

        <div className="stats-grid">
          <StatCard 
            label="Total Balance" 
            value={formatCurrency(data.total_balance, 'INR')} 
            change="Combined liquidity"
          />
          <StatCard 
            label="Estimated Profit" 
            value={formatCurrency(data.total_income - data.total_expense, 'INR')} 
            change={`${((data.total_income - data.total_expense) / (data.total_income || 1) * 100).toFixed(1)}% Margin`}
          />
          <StatCard 
            label="Pending Receivables" 
            value={formatCurrency(data.total_receivable, 'INR')} 
            change="Unpaid Invoices"
            crimson
          />
          <StatCard 
            label="Monthly Burn" 
            value={formatCurrency(data.total_expense / 6, 'INR')} 
            change="Avg. Last 6 Months"
            crimson
          />
        </div>

        <div className="two-col">
          {/* Cashflow Chart */}
          <GlassCard header="Cashflow Trend (Last 6 Months)">
            <div className="p-6">
              <div className="flex justify-end gap-4 mb-4">
                <div className="flex align-center gap-2 text-[10px] text-zinc-400">
                  <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-[#a07818] to-[#d29f22]" /> Income
                </div>
                <div className="flex align-center gap-2 text-[10px] text-zinc-400">
                  <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-[#5d0018] to-[#8a0022]" /> Expense
                </div>
              </div>
              
              <div className="chart-container">
                {data.cashflow.map((m, i) => (
                  <div key={i} className="chart-col">
                    <div className="chart-tooltip">
                      In: {formatCurrency(m.income, 'INR')}<br/>
                      Out: {formatCurrency(m.expense, 'INR')}
                    </div>
                    <div className="chart-bar-group">
                      <div 
                        className="chart-bar income" 
                        style={{ height: `${(m.income / maxVal) * 100}%` }}
                      />
                      <div 
                        className="chart-bar expense" 
                        style={{ height: `${(m.expense / maxVal) * 100}%` }}
                      />
                    </div>
                    <span className="chart-label">{m.month_label.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Bank Accounts */}
          <div className="flex flex-col gap-4">
            <SectionTitle>Bank Accounts</SectionTitle>
            <div className="grid gap-3">
              {accounts.map(acct => (
                <div key={acct.id} className="acct-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="acct-name">{acct.name}</div>
                      <div className="acct-type">{acct.type} • {acct.bank_name}</div>
                    </div>
                    <Landmark size={18} className="text-zinc-600" />
                  </div>
                  <div className="acct-bal">{formatCurrency(acct.balance, acct.currency)}</div>
                </div>
              ))}
              <button className="btn btn-glass btn-full py-6 border-dashed opacity-60">
                <Plus size={18} /> Add Account
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <GlassCard header="Recent Financial Activity">
            {/* We'll add a simplified transaction list here */}
            <div className="p-8 text-center text-zinc-500 italic text-sm">
              Recent income and expenses will appear here.
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  )
}
