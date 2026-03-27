'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { translations } from './translations'

const t = translations.nav

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = [
    { href: '#home', label: t.home },
    { href: '#features', label: t.features },
    { href: '#impact', label: t.impact },
    { href: '#contact', label: t.contact },
  ]

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-background'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-shrink-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aebrlogo-scaled-1-uI6pS56ogWvuzUNNBc6lOh5tHti3Gm.webp"
            alt="AEBR Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-semibold text-lg text-foreground hidden sm:inline">AEBR CMS</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <a key={href} href={href} className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a href="/login" className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors">
            {t.login}
          </a>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-3">
            {links.map(({ href, label }) => (
              <a key={href} href={href} className="block text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                {label}
              </a>
            ))}
            <a href="/login" className="block px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg transition-colors hover:bg-primary/20">
              {t.login}
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
