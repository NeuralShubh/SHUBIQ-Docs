const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  // Dashboard
  getDashboard: () => req<any>('/dashboard'),

  // Documents
  getDocuments: (params?: { type?: string; status?: string }) => {
    const q = new URLSearchParams(params as any).toString()
    return req<any[]>(`/documents${q ? '?' + q : ''}`)
  },
  getDocument: (id: string) => req<any>(`/documents/${id}`),
  createDocument: (data: any) => req<any>('/documents', { method: 'POST', body: JSON.stringify(data) }),
  updateDocument: (id: string, data: any) => req<any>(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateDocumentStatus: (id: string, status: string) => req<any>(`/documents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteDocument: (id: string) => req<any>(`/documents/${id}`, { method: 'DELETE' }),
  recordPayment: (id: string, data: any) => req<any>(`/documents/${id}/record-payment`, { method: 'POST', body: JSON.stringify(data) }),

  // Finance
  getFinanceStats: () => req<any>('/finance/stats'),
  getTransactions: (params?: any) => {
    const q = new URLSearchParams(params).toString()
    return req<any[]>(`/finance/transactions${q ? '?' + q : ''}`)
  },
  createTransaction: (data: any) => req<any>('/finance/transactions', { method: 'POST', body: JSON.stringify(data) }),
  getBankAccounts: () => req<any[]>('/finance/accounts'),
  createBankAccount: (data: any) => req<any>('/finance/accounts', { method: 'POST', body: JSON.stringify(data) }),
  getCategories: (type?: string) => req<any[]>(`/finance/categories${type ? '?type=' + type : ''}`),
  getRecurringPayments: () => req<any[]>('/finance/recurring'),
  createRecurringPayment: (data: any) => req<any>('/finance/recurring', { method: 'POST', body: JSON.stringify(data) }),

  // Clients
  getClients: () => req<any[]>('/clients'),
  getClient: (id: string) => req<any>(`/clients/${id}`),
  createClient: (data: any) => req<any>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id: string, data: any) => req<any>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id: string) => req<any>(`/clients/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => req<any>('/settings'),
  updateSettings: (data: any) => req<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
}
