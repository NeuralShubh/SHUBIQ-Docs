import { Document, CompanySettings } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props {
  doc: Document
  client: { name: string; company: string; email: string; phone: string; address: string; gst_number: string }
  settings: CompanySettings
}

export default function PrintDocument({ doc, client, settings }: Props) {
  const fmt = (n: number) => formatCurrency(n, doc.currency)

  return (
    <div className="print-document" style={{
      fontFamily: "'DM Sans', sans-serif",
      background: '#fff',
      color: '#1a1a1a',
      padding: '14mm 16mm',
      minHeight: '297mm',
      width: '210mm',
    }}>
      {/* Top bar — all 4 palette colors */}
      <div style={{ height: 4, background: 'linear-gradient(90deg,#5d0018,#d29f22,#252628,#d29f22,#5d0018)', borderRadius: 2, marginBottom: 24 }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26, paddingBottom: 20, borderBottom: '1.5px solid #e8dfc0' }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: '#d29f22', letterSpacing: '0.05em' }}>
            {settings.name}
          </div>
          <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>
            {settings.tagline}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: '#555', lineHeight: 1.9 }}>
            {settings.website && (
              <div>
                <a href={settings.website.startsWith('http') ? settings.website : `https://${settings.website}`} style={{ color: '#555', textDecoration: 'none' }}>
                  {settings.website}
                </a>
              </div>
            )}
            {settings.email && (
              <div>
                <a href={`mailto:${settings.email}`} style={{ color: '#555', textDecoration: 'none' }}>
                  {settings.email}
                </a>
              </div>
            )}
            {settings.phone && <div>{settings.phone}</div>}
            {settings.address && <div>{settings.address}</div>}
            {settings.gst_number && <div style={{ color: '#888', fontSize: 10 }}>GSTIN: {settings.gst_number}</div>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 600, color: '#19171b', letterSpacing: '0.02em' }}>
            {doc.type.toUpperCase()}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: '#666', lineHeight: 2 }}>
            <div>{doc.number}</div>
            <div>Date: {formatDate(doc.date)}</div>
            {doc.due_date && <div>{doc.type === 'Estimate' ? 'Valid Until' : 'Due'}: {formatDate(doc.due_date)}</div>}
            <div style={{ marginTop: 4 }}>
              <span style={{
                display: 'inline-flex', padding: '2px 10px', borderRadius: 20,
                fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
                background: doc.status === 'Paid' ? 'rgba(34,197,94,0.1)'
                  : doc.status === 'Unpaid' ? 'rgba(210,159,34,0.12)'
                  : doc.status === 'Cancelled' ? 'rgba(93,0,24,0.1)'
                  : 'rgba(161,161,170,0.1)',
                color: doc.status === 'Paid' ? '#15803d'
                  : doc.status === 'Unpaid' ? '#92600a'
                  : doc.status === 'Cancelled' ? '#5d0018'
                  : '#52525b',
                border: `1px solid ${doc.status === 'Paid' ? 'rgba(34,197,94,0.2)'
                  : doc.status === 'Unpaid' ? 'rgba(210,159,34,0.25)'
                  : doc.status === 'Cancelled' ? 'rgba(93,0,24,0.2)'
                  : 'rgba(161,161,170,0.2)'}`,
              }}>
                {doc.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#d29f22', marginBottom: 8, fontWeight: 600 }}>
            Bill To
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.85, color: '#333' }}>
            <strong style={{ fontSize: 14 }}>{client.name}</strong>
            {client.company && <div>{client.company}</div>}
            {client.email && (
              <div>
                <a href={`mailto:${client.email}`} style={{ color: '#d29f22', textDecoration: 'none' }}>
                  {client.email}
                </a>
              </div>
            )}
            {client.phone && <div>{client.phone}</div>}
            {client.address && <div style={{ color: '#666', fontSize: 11 }}>{client.address}</div>}
            {client.gst_number && <div style={{ color: '#888', fontSize: 10.5, marginTop: 2 }}>GSTIN: {client.gst_number}</div>}
          </div>
        </div>
        {doc.type === 'Receipt' && doc.ref_document && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#d29f22', marginBottom: 8, fontWeight: 600 }}>Reference</div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.9 }}>
              <div>Invoice: <strong>{doc.ref_document}</strong></div>
              {doc.payment_method && <div>Payment via: {doc.payment_method}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#d29f22', marginBottom: 8, fontWeight: 600 }}>
          {doc.type === 'Receipt' ? 'Payment Summary' : 'Services & Deliverables'}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f9f4e8' }}>
              {['Description', 'Category', 'Qty', 'Rate', 'Amount'].map((h, i) => (
                <th key={h} style={{
                  padding: '9px 11px', textAlign: i > 1 ? 'right' : 'left',
                  fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: '#999', borderBottom: '1px solid #ecdfc0', fontWeight: 600,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(doc.line_items || []).map((item, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fdfcf9' }}>
                <td style={{ padding: '9px 11px', borderBottom: '1px solid #f5f0e2', color: '#222', fontWeight: 500 }}>{item.description}</td>
                <td style={{ padding: '9px 11px', borderBottom: '1px solid #f5f0e2', color: '#888', fontSize: 11 }}>{item.category || '—'}</td>
                <td style={{ padding: '9px 11px', borderBottom: '1px solid #f5f0e2', textAlign: 'right', color: '#555' }}>{item.quantity}</td>
                <td style={{ padding: '9px 11px', borderBottom: '1px solid #f5f0e2', textAlign: 'right', color: '#555' }}>{fmt(item.rate)}</td>
                <td style={{ padding: '9px 11px', borderBottom: '1px solid #f5f0e2', textAlign: 'right', color: '#1a1a1a', fontWeight: 600 }}>{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <div style={{ minWidth: 220 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, color: '#666', borderBottom: '1px solid #f0ece0' }}>
              <span>Subtotal</span><span>{fmt(doc.subtotal)}</span>
            </div>
            {doc.tax_rate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, color: '#666', borderBottom: '1px solid #f0ece0' }}>
                <span>GST ({doc.tax_rate}%)</span><span>{fmt(doc.tax_amount)}</span>
              </div>
            )}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px 0 6px', borderTop: '2px solid #d29f22', marginTop: 4,
              fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 600, color: '#d29f22',
            }}>
              <span>{doc.type === 'Receipt' ? 'Amount Received' : 'Total Due'}</span>
              <span>{fmt(doc.total)}</span>
            </div>
            {doc.currency === 'INR' && <div style={{ fontSize: 9, color: '#bbb', textAlign: 'right' }}>Amount in Indian Rupees</div>}
          </div>
        </div>
      </div>

      {/* Payment Details */}
      {(settings.bank_name || settings.upi_id) && doc.type !== 'Receipt' && (
        <div style={{ marginBottom: 16, padding: '11px 14px', background: '#faf5e8', borderRadius: 8, borderLeft: '3px solid #d29f22' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#d29f22', marginBottom: 6, fontWeight: 600 }}>Payment Details</div>
          <div style={{ fontSize: 11, color: '#555', lineHeight: 2 }}>
            {settings.bank_name && <span>Bank: <strong>{settings.bank_name}</strong> &nbsp;|&nbsp; A/C: <strong>{settings.account_number}</strong> &nbsp;|&nbsp; IFSC: <strong>{settings.ifsc_code}</strong></span>}
            {settings.upi_id && <div style={{ marginTop: 1 }}>UPI: <strong style={{ color: '#d29f22' }}>{settings.upi_id}</strong></div>}
          </div>
        </div>
      )}

      {doc.notes && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#d29f22', marginBottom: 5, fontWeight: 600 }}>Notes</div>
          <p style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>{doc.notes}</p>
        </div>
      )}
      {doc.terms && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#d29f22', marginBottom: 5, fontWeight: 600 }}>Terms & Conditions</div>
          <p style={{ fontSize: 10.5, color: '#888', lineHeight: 1.7 }}>{doc.terms}</p>
        </div>
      )}

      {/* Signatures */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 16, borderTop: '1px solid #e8dfc0', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: 40, marginBottom: 7 }} />
          <div style={{ width: 150, borderTop: '1px solid #aaa', paddingTop: 6, fontSize: 10.5, color: '#666', textAlign: 'center', margin: '0 auto' }}>
            Authorized Signatory<br /><strong style={{ color: '#333' }}>{settings.name}</strong>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: 40, marginBottom: 7 }} />
          <div style={{ width: 150, borderTop: '1px solid #aaa', paddingTop: 6, fontSize: 10.5, color: '#666', textAlign: 'center', margin: '0 auto' }}>
            Client Signature
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 22, paddingTop: 12, borderTop: '1px solid #e8dfc0', textAlign: 'center', fontSize: 9, color: '#bbb', letterSpacing: '0.04em' }}>
        {settings.name} · {settings.tagline} · {settings.website ? (
          <a href={settings.website.startsWith('http') ? settings.website : `https://${settings.website}`} style={{ color: '#bbb', textDecoration: 'none' }}>
            {settings.website}
          </a>
        ) : ''}<br />
        This is a computer generated document.
      </div>
      {/* Bottom bar */}
      <div style={{ height: 3, background: 'linear-gradient(90deg,#5d0018,#d29f22,#252628,#d29f22,#5d0018)', marginTop: 14, borderRadius: 2 }} />
    </div>
  )
}
