const pool = require('./pool')

async function setup() {
  const client = await pool.connect()
  try {
    console.log('🔧 Setting up SHUBIQ Docs database...')

    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)

    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        company TEXT DEFAULT '',
        email TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        address TEXT DEFAULT '',
        gst_number TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type TEXT NOT NULL CHECK (type IN ('Invoice','Estimate','Receipt')),
        number TEXT NOT NULL UNIQUE,
        date DATE NOT NULL,
        due_date DATE,
        status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Unpaid','Paid','Cancelled')),
        currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR','USD')),
        client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
        line_items JSONB NOT NULL DEFAULT '[]',
        subtotal NUMERIC(12,2) DEFAULT 0,
        tax_rate NUMERIC(5,2) DEFAULT 18,
        tax_amount NUMERIC(12,2) DEFAULT 0,
        total NUMERIC(12,2) DEFAULT 0,
        notes TEXT DEFAULT '',
        terms TEXT DEFAULT '',
        payment_method TEXT DEFAULT 'Bank Transfer',
        bank_name TEXT DEFAULT '',
        account_number TEXT DEFAULT '',
        ifsc_code TEXT DEFAULT '',
        upi_id TEXT DEFAULT '',
        ref_document TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id INT PRIMARY KEY DEFAULT 1,
        name TEXT DEFAULT 'SHUBIQ',
        tagline TEXT DEFAULT 'Intelligence That Wins',
        email TEXT DEFAULT 'shubiqofficial@gmail.com',
        phone TEXT DEFAULT '',
        website TEXT DEFAULT 'https://shubiq.com',
        address TEXT DEFAULT 'Miraj, Maharashtra, India',
        gst_number TEXT DEFAULT '',
        pan_number TEXT DEFAULT '',
        invoice_prefix TEXT DEFAULT 'INV-',
        estimate_prefix TEXT DEFAULT 'EST-',
        receipt_prefix TEXT DEFAULT 'REC-',
        invoice_counter INT DEFAULT 1,
        estimate_counter INT DEFAULT 1,
        receipt_counter INT DEFAULT 1,
        default_currency TEXT DEFAULT 'INR',
        default_tax_rate NUMERIC(5,2) DEFAULT 18,
        payment_due_days INT DEFAULT 30,
        bank_name TEXT DEFAULT '',
        account_number TEXT DEFAULT '',
        ifsc_code TEXT DEFAULT '',
        account_type TEXT DEFAULT 'Current',
        upi_id TEXT DEFAULT '',
        default_notes TEXT DEFAULT 'Thank you for your business. We look forward to a long-term partnership.',
        default_terms TEXT DEFAULT '50% advance is required to start work, 30% at mid‑project, and the remaining 20% on final delivery. Invoices are payable within 7 days of issue. Work output remains the property of SHUBIQ until full payment is received.'
      )
    `)

    await client.query(`
      INSERT INTO company_settings (id) VALUES (1)
      ON CONFLICT (id) DO NOTHING
    `)

    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ LANGUAGE plpgsql
    `)

    await client.query(`
      DROP TRIGGER IF EXISTS documents_updated_at ON documents;
      CREATE TRIGGER documents_updated_at
        BEFORE UPDATE ON documents
        FOR EACH ROW EXECUTE FUNCTION update_updated_at()
    `)

    // Sample clients
    await client.query(`
      INSERT INTO clients (name, company, email, phone, address, gst_number) VALUES
        ('Arjun Mehta','TechVentures Pvt Ltd','arjun@techventures.com','+91 98765 43210','401, Tech Park, Baner, Pune 411045','27AABCT3518Q1ZV'),
        ('Priya Sharma','CloudBridge Inc','priya@cloudbridge.com','+91 91234 56789','12, MG Road, Bengaluru 560001','29AAKCS9460H1ZX'),
        ('Rahul Kapoor','StartupLab','rahul@startuplab.in','+91 87654 32109','5th Floor, Cyber Hub, Gurugram 122002','06AABCS1429B1ZP')
      ON CONFLICT DO NOTHING
    `)

    console.log('✅ Database setup complete!')
  } catch (err) {
    console.error('❌ Setup error:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

setup()
