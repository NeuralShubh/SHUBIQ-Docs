const router = require('express').Router()
const pool = require('../db/pool')

// GET all clients
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM clients ORDER BY name ASC'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single client
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM clients WHERE id = $1', [req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Client not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create client
router.post('/', async (req, res) => {
  const { name, company, email, phone, address, gst_number } = req.body
  if (!name) return res.status(400).json({ error: 'Name is required' })
  try {
    const { rows } = await pool.query(
      `INSERT INTO clients (name, company, email, phone, address, gst_number)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, company||'', email||'', phone||'', address||'', gst_number||'']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT update client
router.put('/:id', async (req, res) => {
  const { name, company, email, phone, address, gst_number } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE clients SET name=$1,company=$2,email=$3,phone=$4,address=$5,gst_number=$6
       WHERE id=$7 RETURNING *`,
      [name, company||'', email||'', phone||'', address||'', gst_number||'', req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Client not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE client
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM clients WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
