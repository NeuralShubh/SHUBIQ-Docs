const router = require('express').Router()
const pool = require('../db/pool')

// GET settings
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM company_settings WHERE id=1')
    res.json(rows[0] || {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT update settings
router.put('/', async (req, res) => {
  const s = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE company_settings SET
        name=$1,tagline=$2,email=$3,phone=$4,website=$5,address=$6,
        gst_number=$7,pan_number=$8,invoice_prefix=$9,estimate_prefix=$10,
        receipt_prefix=$11,invoice_counter=$12,estimate_counter=$13,receipt_counter=$14,
        default_currency=$15,default_tax_rate=$16,payment_due_days=$17,
        bank_name=$18,account_number=$19,ifsc_code=$20,account_type=$21,upi_id=$22,
        default_notes=$23,default_terms=$24
       WHERE id=1 RETURNING *`,
      [s.name,s.tagline,s.email,s.phone,s.website,s.address,
       s.gst_number,s.pan_number,s.invoice_prefix,s.estimate_prefix,
       s.receipt_prefix,s.invoice_counter,s.estimate_counter,s.receipt_counter,
       s.default_currency,s.default_tax_rate,s.payment_due_days,
       s.bank_name,s.account_number,s.ifsc_code,s.account_type,s.upi_id,
       s.default_notes,s.default_terms]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
