require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()
const PORT = process.env.PORT || 4000

// Security
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json({ limit: '5mb' }))

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}))

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests, please try again later.' }
}))

// Routes
app.use('/api/clients', require('./routes/clients'))
app.use('/api/documents', require('./routes/documents'))
app.use('/api/settings', require('./routes/settings'))
app.use('/api/dashboard', require('./routes/dashboard'))
app.use('/api/finance', require('./routes/finance'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'SHUBIQ Docs', time: new Date().toISOString() })
})

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 SHUBIQ Docs API running on port ${PORT}`)
})
