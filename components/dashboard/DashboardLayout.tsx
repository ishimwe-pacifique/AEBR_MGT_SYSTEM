'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogOut, ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
  roleLabel: string
  roleColor: string
}

export default function DashboardLayout({ children, navItems, roleLabel, roleColor }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user as any

  return (
    <div className="min-h-screen bg-[#f8faf8] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a3a2a] text-white flex flex-col transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aebrlogo-scaled-1-uI6pS56ogWvuzUNNBc6lOh5tHti3Gm.webp"
            alt="AEBR"
            className="w-8 h-8 object-contain"
          />
          <span className="font-bold text-lg">AEBR CMS</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-6 py-4 border-b border-white/10">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${roleColor}`}>
            {roleLabel}
          </span>
          <p className="mt-2 text-sm font-medium text-white/90 truncate">{user?.name}</p>
          <p className="text-xs text-white/50 truncate">{user?.email}</p>
          {user?.churchName && <p className="text-xs text-[#c9a84c] mt-1 truncate">{user.churchName}</p>}
          {user?.districtName && <p className="text-xs text-[#c9a84c] mt-1 truncate">{user.districtName} District</p>}
          {user?.provinceName && <p className="text-xs text-[#c9a84c] mt-1 truncate">{user.provinceName}</p>}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? 'bg-[#c9a84c] text-[#1a3a2a] shadow-md'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Sign Out */}
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1a3a2a] flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0] ?? 'U'}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">{user?.name}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
