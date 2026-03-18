export type DocumentType = 'Invoice' | 'Estimate' | 'Receipt'
export type DocumentStatus = 'Draft' | 'Unpaid' | 'Paid' | 'Cancelled'
export type Currency = 'INR' | 'USD'

export interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  address: string
  gst_number: string
  created_at: string
}

export interface LineItem {
  id: string
  description: string
  category: string
  quantity: number
  rate: number
  amount: number
}

export interface Document {
  id: string
  type: DocumentType
  number: string
  date: string
  due_date: string
  status: DocumentStatus
  currency: Currency
  client_id: string
  client?: Client
  line_items: LineItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes: string
  terms: string
  payment_method: string
  bank_name: string
  account_number: string
  ifsc_code: string
  upi_id: string
  ref_document: string
  created_at: string
  updated_at: string
}

export interface CompanySettings {
  name: string
  tagline: string
  email: string
  phone: string
  website: string
  address: string
  gst_number: string
  pan_number: string
  invoice_prefix: string
  estimate_prefix: string
  receipt_prefix: string
  invoice_counter: number
  estimate_counter: number
  receipt_counter: number
  default_currency: Currency
  default_tax_rate: number
  payment_due_days: number
  bank_name: string
  account_number: string
  ifsc_code: string
  account_type: string
  upi_id: string
  default_notes: string
  default_terms: string
}
