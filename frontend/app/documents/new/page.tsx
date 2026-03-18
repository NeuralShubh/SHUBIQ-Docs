import DocumentForm from '@/components/documents/DocumentForm'
import { DocumentType } from '@/types'

export default function NewDocumentPage({ searchParams }: { searchParams: { type?: string } }) {
  const type = (searchParams?.type as DocumentType) || 'Invoice'
  return <DocumentForm initialType={type} />
}
