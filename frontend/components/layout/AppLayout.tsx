'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { section: 'Finance' },
  { href: '/finance', label: 'Overview' },
  { href: '/finance/transactions', label: 'Transactions' },
  { href: '/finance/accounts', label: 'Bank Accounts' },
  { section: 'Documents' },
  { href: '/invoices', label: 'Invoices' },
  { href: '/estimates', label: 'Estimates' },
  { href: '/receipts', label: 'Receipts' },
  { href: '/documents/new', label: 'New Document', accent: true },
  { section: 'Business' },
  { href: '/clients', label: 'Clients' },
  { section: 'System' },
  { href: '/settings', label: 'Settings' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR')

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false) }, [pathname])

  // Prevent body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const activeHref = navItems
    .filter((item: any) => 'href' in item && item.href)
    .map((item: any) => item.href as string)
    .filter(href => pathname === href || (href !== '/dashboard' && pathname.startsWith(href)))
    .sort((a, b) => b.length - a.length)[0]

  const isActive = (href: string) => href === activeHref

  return (
    <>
      {/* ── TOPBAR ── */}
      <header className="topbar no-print">
        <button
          className={`hamburger${sidebarOpen ? ' open' : ''}`}
          onClick={() => setSidebarOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <span className="topbar-logo">SHUBIQ</span>
        <span className="topbar-sub">Docs</span>

        <div className="topbar-right">
          <div className="cur-switch">
            <button
              className={`cur-btn${currency === 'INR' ? ' active' : ''}`}
              onClick={() => setCurrency('INR')}
            >₹ INR</button>
            <button
              className={`cur-btn${currency === 'USD' ? ' active' : ''}`}
              onClick={() => setCurrency('USD')}
            >$ USD</button>
          </div>
          <div className="topbar-avatar">SB</div>
        </div>
      </header>

      {/* ── SIDEBAR OVERLAY ── */}
      <div
        className={`sidebar-overlay no-print${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── SIDEBAR ── */}
      <nav className={`sidebar no-print${sidebarOpen ? ' open' : ''}`}>
        {navItems.map((item, i) => {
          if ('section' in item) {
            return <div key={i} className="nav-section">{item.section}</div>
          }
          const active = isActive(item.href!)
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`nav-item${active ? ' active' : ''}`}
            >
              <span className="nav-dot" style={item.accent ? { background: 'var(--c2)', opacity: 1 } : {}} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* ── MAIN ── */}
      <div className="app-layout">
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="bottom-nav no-print">
        <div className="bottom-nav-inner">
          {/* Dashboard */}
          <button
            className={`bn-item${pathname === '/dashboard' ? ' active' : ''}`}
            onClick={() => router.push('/dashboard')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="1.6">
              <rect x="2" y="2" width="7" height="7" rx="1.5" />
              <rect x="11" y="2" width="7" height="7" rx="1.5" />
              <rect x="2" y="11" width="7" height="7" rx="1.5" />
              <rect x="11" y="11" width="7" height="7" rx="1.5" />
            </svg>
            <span className="bn-label">Home</span>
          </button>

          {/* Finance */}
          <button
            className={`bn-item${pathname.startsWith('/finance') ? ' active' : ''}`}
            onClick={() => router.push('/finance')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="1.6">
              <path d="M2 15h16M2 11h16M2 7h16" />
              <rect x="5" y="4" width="2" height="12" />
              <rect x="13" y="4" width="2" height="12" />
            </svg>
            <span className="bn-label">Finance</span>
          </button>

          {/* Invoices */}
          <button
            className={`bn-item${pathname.startsWith('/invoices') ? ' active' : ''}`}
            onClick={() => router.push('/invoices')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="1.6">
              <path d="M4 2h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
              <path d="M7 7h6M7 10h6M7 13h4" strokeLinecap="round" />
            </svg>
            <span className="bn-label">Invoices</span>
          </button>

          {/* FAB — New Document */}
          <button
            className="bn-fab"
            onClick={() => router.push('/documents/new')}
            aria-label="New document"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 4v14M4 11h14" stroke="#19171b" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Clients */}
          <button
            className={`bn-item${pathname.startsWith('/clients') ? ' active' : ''}`}
            onClick={() => router.push('/clients')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="1.6">
              <circle cx="10" cy="6" r="3.5" />
              <path d="M3 18c0-4 3-6 7-6s7 2 7 6" strokeLinecap="round" />
            </svg>
            <span className="bn-label">Clients</span>
          </button>

          {/* Settings */}
          <button
            className={`bn-item${pathname.startsWith('/settings') ? ' active' : ''}`}
            onClick={() => router.push('/settings')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="1.6">
              <circle cx="10" cy="10" r="2.5" />
              <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" strokeLinecap="round" />
            </svg>
            <span className="bn-label">Settings</span>
          </button>
        </div>
      </nav>
    </>
  )
}
