const router = require('express').Router()
const pool = require('../db/pool')

// GET all documents (with client join)
router.get('/', async (req, res) => {
  try {
    const { type, status } = req.query
    let q = `
      SELECT d.*, row_to_json(c) AS client
      FROM documents d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE 1=1
    `
    const params = []
    if (type) { params.push(type); q += ` AND d.type = $${params.length}` }
    if (status) { params.push(status); q += ` AND d.status = $${params.length}` }
    q += ' ORDER BY d.created_at DESC'
    const { rows } = await pool.query(q, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single document
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.*, row_to_json(c) AS client
       FROM documents d
       LEFT JOIN clients c ON d.client_id = c.id
       WHERE d.id = $1`,
      [req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Document not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create document
router.post('/', async (req, res) => {
  const {
    type, number, date, due_date, status, currency, client_id,
    line_items, subtotal, tax_rate, tax_amount, total,
    notes, terms, payment_method, bank_name, account_number,
    ifsc_code, upi_id, ref_document
  } = req.body

  if (!type || !number || !date) {
    return res.status(400).json({ error: 'type, number and date are required' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query(
      `INSERT INTO documents
        (type,number,date,due_date,status,currency,client_id,line_items,
         subtotal,tax_rate,tax_amount,total,notes,terms,payment_method,
         bank_name,account_number,ifsc_code,upi_id,ref_document)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       RETURNING *`,
      [type,number,date,due_date||null,status||'Draft',currency||'INR',client_id||null,
       JSON.stringify(line_items||[]),subtotal||0,tax_rate||18,tax_amount||0,total||0,
       notes||'',terms||'',payment_method||'Bank Transfer',
       bank_name||'',account_number||'',ifsc_code||'',upi_id||'',ref_document||'']
    )

    // Increment counter
    const counterField = type === 'Invoice' ? 'invoice_counter'
      : type === 'Estimate' ? 'estimate_counter' : 'receipt_counter'
    await client.query(
      `UPDATE company_settings SET ${counterField} = ${counterField} + 1 WHERE id = 1`
    )

    await client.query('COMMIT')
    res.status(201).json(rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Document number already exists' })
    }
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// PUT update document
router.put('/:id', async (req, res) => {
  const {
    type, number, date, due_date, status, currency, client_id,
    line_items, subtotal, tax_rate, tax_amount, total,
    notes, terms, payment_method, bank_name, account_number,
    ifsc_code, upi_id, ref_document
  } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE documents SET
        type=$1,number=$2,date=$3,due_date=$4,status=$5,currency=$6,client_id=$7,
        line_items=$8,subtotal=$9,tax_rate=$10,tax_amount=$11,total=$12,
        notes=$13,terms=$14,payment_method=$15,bank_name=$16,account_number=$17,
        ifsc_code=$18,upi_id=$19,ref_document=$20
       WHERE id=$21 RETURNING *`,
      [type,number,date,due_date||null,status,currency,client_id||null,
       JSON.stringify(line_items||[]),subtotal,tax_rate,tax_amount,total,
       notes,terms,payment_method,bank_name,account_number,ifsc_code,upi_id,ref_document,
       req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Document not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH status only
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body
  const valid = ['Draft','Unpaid','Paid','Cancelled']
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' })
  try {
    const { rows } = await pool.query(
      'UPDATE documents SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE document
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM documents WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// RECORD PAYMENT
router.post('/:id/record-payment', async (req, res) => {
  const { 
    amountPaid, 
    discount, 
    accountId, 
    date, 
    description,
    paymentMethod,
    categoryId // Category for the income
  } = req.body

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. Get current document
    const { rows: docs } = await client.query('SELECT total, paid_amount, discount_amount, number FROM documents WHERE id = $1', [req.params.id])
    if (!docs[0]) return res.status(404).json({ error: 'Document not found' })
    const doc = docs[0]

    const sub_paid = parseFloat(amountPaid) || 0
    const sub_discount = parseFloat(discount) || 0
    const new_paid_total = parseFloat(doc.paid_amount) + sub_paid
    const new_discount_total = parseFloat(doc.discount_amount) + sub_discount
    
    // 2. Determine new status
    let status = 'Unpaid'
    if (new_paid_total + new_discount_total >= doc.total) {
      status = 'Paid'
      if (new_discount_total > 0) status = 'Closed' // Specialized status for settled with discount
    } else if (new_paid_total > 0) {
      status = 'Partially Paid'
    }

    // 3. Update document
    const { rows: updated } = await client.query(
      `UPDATE documents SET 
        paid_amount = $1, 
        discount_amount = $2, 
        status = $3,
        updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [new_paid_total, new_discount_total, status, req.params.id]
    )

    // 4. Create Income Transaction
    if (sub_paid > 0) {
      await client.query(
        `INSERT INTO transactions (date, amount, type, description, account_id, related_document_id, category_id)
         VALUES ($1, $2, 'Income', $3, $4, $5, $6)`,
        [date || new Date(), sub_paid, description || `Payment for Invoice #${doc.number}`, accountId, req.params.id, categoryId]
      )

      // 5. Update Bank Account Balance
      if (accountId) {
        await client.query(
          `UPDATE bank_accounts SET balance = balance + $1 WHERE id = $2`,
          [sub_paid, accountId]
        )
      }
    }

    // 6. Record Write-Off Transaction (if any discount)
    if (sub_discount > 0) {
      await client.query(
        `INSERT INTO transactions (date, amount, type, description, related_document_id)
         VALUES ($1, $2, 'Write-Off', $3, $4)`,
        [date || new Date(), sub_discount, `Discount/Write-off for Invoice #${doc.number}`, req.params.id]
      )
    }

    await client.query('COMMIT')
    res.json(updated[0])
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

module.exports = router
