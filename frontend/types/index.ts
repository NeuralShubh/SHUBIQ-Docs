export type DocumentType = 'Invoice' | 'Estimate' | 'Receipt'
export type DocumentStatus = 'Draft' | 'Unpaid' | 'Paid' | 'Partially Paid' | 'Cancelled' | 'Closed'
export type Currency = 'INR' | 'USD'
export type TransactionType = 'Income' | 'Expense' | 'Transfer' | 'Write-Off'

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

export interface BankAccount {
  id: string
  name: string
  type: string
  balance: number
  currency: Currency
  account_number: string
  ifsc_code: string
  bank_name: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  type: 'Income' | 'Expense'
  icon: string
}

export interface Transaction {
  id: string
  date: string
  amount: number
  type: TransactionType
  description: string
  category_id?: string
  category_name?: string
  category_icon?: string
  account_id?: string
  account_name?: string
  related_document_id?: string
  created_at: string
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
  paid_amount: number
  discount_amount: number
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

export interface FinancialSummary {
  total_income: number
  total_expense: number
  total_balance: number
  total_receivable: number
  cashflow: {
    month_label: string
    income: number
    expense: number
  }[]
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
