const router = require('express').Router()
const pool = require('../db/pool')

router.get('/', async (req, res) => {
  try {
    const [stats, recent] = await Promise.all([
      pool.query(`
        SELECT
          COALESCE(SUM(CASE WHEN type='Invoice' THEN total ELSE 0 END),0) AS total_invoiced,
          COALESCE(SUM(CASE WHEN status='Paid' THEN total ELSE 0 END),0) AS total_paid,
          COALESCE(SUM(CASE WHEN status='Unpaid' THEN total ELSE 0 END),0) AS total_pending,
          COUNT(*) AS total_documents,
          COUNT(CASE WHEN created_at >= date_trunc('month', NOW()) THEN 1 END) AS this_month
        FROM documents
      `),
      pool.query(`
        SELECT d.*, row_to_json(c) AS client
        FROM documents d
        LEFT JOIN clients c ON d.client_id = c.id
        ORDER BY d.created_at DESC LIMIT 8
      `)
    ])
    res.json({
      stats: stats.rows[0],
      recent: recent.rows
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
