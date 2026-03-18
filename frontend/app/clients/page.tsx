'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { PageHeader, SectionTitle, FormGroup, showToast, ToastProvider } from '@/components/ui'
import { api } from '@/lib/api'
import { Client } from '@/types'
import { initials } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'

const empty = (): Partial<Client> => ({ name: '', company: '', email: '', phone: '', address: '', gst_number: '' })

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState<Partial<Client>>(empty())
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try { setClients(await api.getClients()) }
    catch { showToast('Failed to load clients', 'error') }
    finally { setLoading(false) }
  }

  function startNew() { setForm(empty()); setEditing(null); setShowForm(true) }
  function startEdit(c: Client) { setForm({ ...c }); setEditing(c); setShowForm(true) }
  function cancel() { setShowForm(false); setEditing(null); setForm(empty()) }

  async function save() {
    if (!form.name?.trim()) return showToast('Name is required', 'error')
    setSaving(true)
    try {
      if (editing) {
        const updated = await api.updateClient(editing.id, form)
        setClients(clients.map(c => c.id === editing.id ? updated : c))
        showToast('Client updated!', 'success')
      } else {
        const created = await api.createClient(form)
        setClients([...clients, created])
        showToast('Client added!', 'success')
      }
      cancel()
    } catch { showToast('Failed to save client', 'error') }
    finally { setSaving(false) }
  }

  async function del(id: string) {
    if (!confirm('Delete this client? Their documents will remain.')) return
    try {
      await api.deleteClient(id)
      setClients(clients.filter(c => c.id !== id))
      showToast('Client deleted', 'success')
    } catch { showToast('Failed to delete', 'error') }
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <ToastProvider />
      <PageHeader
        title="Clients"
        subtitle="Manage your client profiles"
        action={
          <button className="btn btn-gold" onClick={startNew}><Plus size={14} /> Add Client</button>
        }
      />

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{
          background: 'rgba(37,38,40,0.6)', border: '1px solid rgba(210,159,34,0.3)',
          borderRadius: 'var(--r2)', padding: 20, marginBottom: 20,
          backdropFilter: 'blur(16px)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <SectionTitle>{editing ? 'Edit Client' : 'New Client'}</SectionTitle>
            <button onClick={cancel} style={{ background: 'transparent', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 8, minHeight: 'unset' }}>
              <X size={16} />
            </button>
          </div>
          <div className="form-grid">
            <FormGroup label="Full Name">
              <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Client full name" />
            </FormGroup>
            <FormGroup label="Company">
              <input value={form.company || ''} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
            </FormGroup>
            <FormGroup label="Email">
              <input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" />
            </FormGroup>
            <FormGroup label="Phone">
              <input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 99999 99999" />
            </FormGroup>
            <FormGroup label="GST Number">
              <input value={form.gst_number || ''} onChange={e => setForm({ ...form, gst_number: e.target.value })} placeholder="22AAAAA0000A1Z5" />
            </FormGroup>
            <FormGroup label="Address">
              <input value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Billing address" />
            </FormGroup>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-gold" onClick={save} disabled={saving} style={{ flex: 1 }}>
              <Check size={13} /> {saving ? 'Saving...' : editing ? 'Update' : 'Save Client'}
            </button>
            <button className="btn btn-glass" onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-bar">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4" stroke="var(--text3)" strokeWidth="1.2" />
          <path d="M9.5 9.5L12 12" stroke="var(--text3)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." />
      </div>

      {/* Grid */}
      {loading ? (
        <p style={{ color: 'var(--text2)', padding: 20, textAlign: 'center' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign: 'center', padding: 48, color: 'var(--text3)' }}>
          {search ? 'No clients match your search.' : 'No clients yet. Add your first client above.'}
        </p>
      ) : (
        <div className="client-grid">
          {filtered.map(c => (
            <div key={c.id} className="client-card">
              <div className="client-avatar">{initials(c.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: 14 }}>{c.name}</div>
                {c.company && <div style={{ fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.company}</div>}
                {c.email && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{c.email}</div>}
                {c.gst_number && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>GST: {c.gst_number}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="btn btn-glass btn-icon btn-sm" onClick={() => startEdit(c)} title="Edit"><Pencil size={11} /></button>
                <button className="btn btn-danger btn-icon btn-sm" onClick={() => del(c.id)} title="Delete"><Trash2 size={11} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
