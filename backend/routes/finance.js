const router = require('express').Router()
const pool = require('../db/pool')

// --- DASHBOARD STATS ---
router.get('/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'Income') as total_income,
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'Expense') as total_expense,
        (SELECT COALESCE(SUM(balance), 0) FROM bank_accounts) as total_balance,
        (SELECT COALESCE(SUM(total - paid_amount - discount_amount), 0) FROM documents WHERE type = 'Invoice' AND status != 'Paid' AND status != 'Closed' AND status != 'Cancelled') as total_receivable
    `)

    // Monthly cashflow (last 6 months)
    const cashflow = await pool.query(`
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', NOW()) - INTERVAL '5 months',
          date_trunc('month', NOW()),
          '1 month'::interval
        )::date AS month
      )
      SELECT
        to_char(m.month, 'Mon YYYY') as month_label,
        COALESCE(SUM(CASE WHEN t.type = 'Income' THEN t.amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN t.type = 'Expense' THEN t.amount ELSE 0 END), 0) as expense
      FROM months m
      LEFT JOIN transactions t ON date_trunc('month', t.date) = m.month
      GROUP BY m.month
      ORDER BY m.month ASC
    `)

    res.json({
      summary: stats.rows[0],
      cashflow: cashflow.rows
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- TRANSACTIONS ---
router.get('/transactions', async (req, res) => {
  try {
    const { type, account_id, limit = 50 } = req.query
    let q = `
      SELECT t.*, c.name as category_name, c.icon as category_icon, a.name as account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN bank_accounts a ON t.account_id = a.id
      WHERE 1=1
    `
    const params = []
    if (type) { params.push(type); q += ` AND t.type = $${params.length}` }
    if (account_id) { params.push(account_id); q += ` AND t.account_id = $${params.length}` }
    
    q += ` ORDER BY t.date DESC, t.created_at DESC LIMIT $${params.length + 1}`
    params.push(limit)

    const { rows } = await pool.query(q, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/transactions', async (req, res) => {
  const { date, amount, type, description, category_id, account_id, related_document_id } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    // Insert transaction
    const { rows } = await client.query(
      `INSERT INTO transactions (date, amount, type, description, category_id, account_id, related_document_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [date || new Date(), amount, type, description, category_id, account_id, related_document_id]
    )

    // Update account balance
    if (account_id) {
      const balanceChange = type === 'Income' ? amount : (type === 'Expense' ? -amount : 0)
      if (balanceChange !== 0) {
        await client.query(
          `UPDATE bank_accounts SET balance = balance + $1 WHERE id = $2`,
          [balanceChange, account_id]
        )
      }
    }

    await client.query('COMMIT')
    res.status(201).json(rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// --- ACCOUNTS ---
router.get('/accounts', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM bank_accounts ORDER BY is_default DESC, name ASC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/accounts', async (req, res) => {
  const { name, type, balance, currency, account_number, ifsc_code, bank_name, is_default } = req.body
  try {
    if (is_default) {
      await pool.query('UPDATE bank_accounts SET is_default = false')
    }
    const { rows } = await pool.query(
      `INSERT INTO bank_accounts (name, type, balance, currency, account_number, ifsc_code, bank_name, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, type || 'Current Account', balance || 0, currency || 'INR', account_number || '', ifsc_code || '', bank_name || '', is_default || false]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- CATEGORIES ---
router.get('/categories', async (req, res) => {
  try {
    const { type } = req.query
    let q = 'SELECT * FROM categories'
    const params = []
    if (type) { params.push(type); q += ' WHERE type = $1' }
    q += ' ORDER BY name ASC'
    const { rows } = await pool.query(q, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- RECURRING PAYMENTS ---
router.get('/recurring', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.*, c.name as category_name, a.name as account_name
      FROM recurring_payments r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN bank_accounts a ON r.account_id = a.id
      ORDER BY next_date ASC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/recurring', async (req, res) => {
  const { name, amount, type, frequency, category_id, account_id, next_date } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO recurring_payments (name, amount, type, frequency, category_id, account_id, next_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, amount, type, frequency, category_id, account_id, next_date]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
