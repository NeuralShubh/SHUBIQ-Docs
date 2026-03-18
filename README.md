# SHUBIQ Docs v3
### Intelligence That Wins — Premium Invoice, Estimate & Receipt Generator

**Stack:** Next.js 14 + TypeScript (frontend) · Node.js + Express + PostgreSQL (backend on your VPS)  
**Theme:** Glassmorphism · `#19171b` · `#d29f22` · `#252628` · `#5d0018`  
**Responsive:** Mobile-first · Bottom navigation · Touch-optimized

---

## 📁 Project Structure

```
shubiq-docs-v3/
├── backend/                   # Node.js + Express API
│   ├── server.js              # Main Express server
│   ├── db/
│   │   ├── pool.js            # PostgreSQL connection pool
│   │   └── setup.js           # Run once to create tables
│   └── routes/
│       ├── documents.js       # CRUD for invoices/estimates/receipts
│       ├── clients.js         # CRUD for clients
│       ├── settings.js        # Company settings
│       └── dashboard.js       # Stats aggregation
│
└── frontend/                  # Next.js 14 App Router
    ├── app/                   # All pages
    ├── components/
    │   ├── layout/AppLayout   # Responsive layout (topbar + sidebar + bottom nav)
    │   ├── ui/                # Shared UI components
    │   └── documents/         # DocumentForm, PrintDocument, DocsListPage
    ├── lib/
    │   ├── api.ts             # All API calls to your VPS backend
    │   └── utils.ts           # Helpers
    └── styles/globals.css     # Full responsive glassmorphism theme
```

---

## 🚀 Setup Guide

### Step 1 — PostgreSQL on your VPS

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update && sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE shubiq_docs;
CREATE USER shubiq WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE shubiq_docs TO shubiq;
\q
```

### Step 2 — Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
nano .env
# Fill in: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, PORT, FRONTEND_URL

# Create all database tables + sample data
node db/setup.js

# Start server
npm start
# or for development:
npm run dev
```

### Step 3 — Frontend Setup

```bash
cd frontend
npm install

# Configure API URL
cp .env.local.example .env.local
nano .env.local
# Set: NEXT_PUBLIC_API_URL=http://your-vps-ip:4000/api

# Run development server
npm run dev

# Build for production
npm run build && npm start
```

---

## 🌐 Production Deployment on VPS

### Backend with PM2
```bash
npm install -g pm2
cd backend
pm2 start server.js --name shubiq-docs-api
pm2 save
pm2 startup
```

### Frontend with Nginx + PM2
```bash
cd frontend
npm run build
pm2 start npm --name shubiq-docs-web -- start
```

### Nginx config (`/etc/nginx/sites-available/shubiq-docs`)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/shubiq-docs /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### SSL with Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📄 PDF Generation

Browser print → Save as PDF (zero dependencies):
1. Open any document → click **Print / Save PDF**  
2. In print dialog: destination → **Save as PDF** → Save  

The document prints as clean A4 white with SHUBIQ branding.

---

## 📱 Mobile Features

- **Bottom navigation bar** — Dashboard, Invoices, + FAB, Clients, Settings
- **Hamburger sidebar** — slides in from left with overlay
- **Card view** on mobile (tables hidden, card layout shown)
- **Touch targets** minimum 44px on all interactive elements
- **Horizontal scroll** on line items table
- **Full-width buttons** on mobile for easy tapping
- **Sticky action buttons** on forms

---

## ✨ Features

| Feature | Details |
|---|---|
| Documents | Invoice · Estimate · Receipt |
| Currency | ₹ INR · $ USD |
| Tax | GST 5% / 12% / 18% / 28% |
| Numbering | Auto (INV-001) or manual |
| Clients | Full CRUD with GST, search |
| PDF | Browser print → Save as PDF |
| Status | Draft · Unpaid · Paid · Cancelled |
| Preview | Live document preview before saving |
| Signatures | Dual signature fields |
| Terms | Customizable per document |
| Bank Details | Printed on invoices |
| Settings | All defaults configurable |
| Responsive | Mobile-first, works on all screens |

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard` | Stats + recent docs |
| GET | `/api/documents` | All documents (filter: `?type=Invoice&status=Paid`) |
| GET | `/api/documents/:id` | Single document with client |
| POST | `/api/documents` | Create document |
| PUT | `/api/documents/:id` | Update document |
| PATCH | `/api/documents/:id/status` | Update status only |
| DELETE | `/api/documents/:id` | Delete document |
| GET | `/api/clients` | All clients |
| POST | `/api/clients` | Create client |
| PUT | `/api/clients/:id` | Update client |
| DELETE | `/api/clients/:id` | Delete client |
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update settings |

---

Built by **SHUBIQ** · Intelligence That Wins · [shubiq.com](https://shubiq.com)
