'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import DocumentForm from '@/components/documents/DocumentForm'
import { api } from '@/lib/api'

export default function EditDocumentPage({ params }: { params: { id: string } }) {
  const [doc, setDoc] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDocument(params.id)
      .then(setDoc)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <AppLayout><div style={{ padding: 40, color: 'var(--text2)', textAlign: 'center' }}>Loading...</div></AppLayout>
  if (!doc) return <AppLayout><div style={{ padding: 40, color: 'var(--text2)', textAlign: 'center' }}>Document not found.</div></AppLayout>

  return <DocumentForm existingDoc={doc} />
}
