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
  { href: '/finance/recurring', label: 'Recurring' },
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
    </>
  )
}
