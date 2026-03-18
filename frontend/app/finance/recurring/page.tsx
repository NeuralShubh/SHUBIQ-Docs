'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import AppLayout from '@/components/layout/AppLayout'
import { PageHeader, GlassCard, showToast, ToastProvider } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Calendar, ArrowRight, Trash2 } from 'lucide-react'

export default function RecurringPaymentsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    api.getRecurringPayments().then(res => {
      setItems(res)
      setLoading(false)
    })
  }

  return (
    <AppLayout>
      <ToastProvider />
      <div className="animate-in">
        <PageHeader 
          title="Recurring Payments" 
          subtitle="Manage subscriptions and scheduled business expenses"
          action={
            <button disabled className="btn btn-gold btn-sm"><Plus size={16} /> New Schedule</button>
          }
        />

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="p-8 text-zinc-500">Loading schedules...</div>
          ) : items.length === 0 ? (
            <GlassCard>
              <div className="p-12 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-600">
                  <Calendar size={32} />
                </div>
                <div>
                  <div className="text-white font-medium">No recurring payments yet</div>
                  <div className="text-zinc-500 text-sm max-w-xs mx-auto mt-1">
                    Set up automatic tracking for rent, subscriptions, or recurring retainer income.
                  </div>
                </div>
                <button disabled className="btn btn-glass mt-2">Start Recurring Schedule</button>
              </div>
            </GlassCard>
          ) : (
            <div className="grid gap-4">
              {items.map(item => (
                <GlassCard key={item.id}>
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.type === 'Income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {item.type === 'Income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      </div>
                      <div>
                        <div className="text-white font-medium">{item.name}</div>
                        <div className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
                          {item.frequency} • Next: {formatDate(item.next_date)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-xl font-display text-white">{formatCurrency(item.amount, 'INR')}</div>
                        <div className="text-[10px] text-zinc-500">From {item.account_name}</div>
                      </div>
                      <button className="p-2 hover:bg-rose-500/10 text-zinc-600 hover:text-rose-500 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

function TrendingUp(props: any) {
  return <ArrowRight {...props} className={props.className + " -rotate-45"} />
}
function TrendingDown(props: any) {
  return <ArrowRight {...props} className={props.className + " rotate-45"} />
}
