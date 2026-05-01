'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

const roleRedirectMap: Record<string, string> = {
  pastor:         '/dashboard/church/pastor',
  registrar:      '/dashboard/church/registrar',
  accountant:     '/dashboard/church/accountant',
  district_admin: '/dashboard/district',
  province_admin: '/dashboard/province',
  national_admin: '/dashboard/admin',
}

const demoAccounts = [
  { role: 'Pastor',         email: 'pastor@aebr.rw',      color: 'bg-[#1a3a2a] text-white' },
  { role: 'Registrar',      email: 'registrar@aebr.rw',   color: 'bg-blue-600 text-white' },
  { role: 'Accountant',     email: 'accountant@aebr.rw',  color: 'bg-[#c9a84c] text-[#1a3a2a]' },
  { role: 'District Admin', email: 'district@aebr.rw',    color: 'bg-purple-600 text-white' },
  { role: 'Province Admin', email: 'province@aebr.rw',    color: 'bg-orange-600 text-white' },
  { role: 'National Admin', email: 'admin@aebr.rw',       color: 'bg-red-600 text-white' },
]

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeDemo, setActiveDemo] = useState<string | null>(null)

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password123')
    setActiveDemo(demoEmail)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password. Use the demo buttons below to auto-fill.')
      setLoading(false)
      return
    }

    const res = await fetch('/api/auth/session')
    const session = await res.json()
    const role = session?.user?.role
    const target = roleRedirectMap[role] ?? '/dashboard'
    router.push(target)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aebrlogo-scaled-1-uI6pS56ogWvuzUNNBc6lOh5tHti3Gm.webp"
              alt="AEBR Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-lg text-foreground hidden sm:inline">AEBR CMS</span>
          </div>
          <Link href="/" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-4rem)] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        {/* Left image panel */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 relative z-10">
          <div className="w-full max-w-sm relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AEBR-Legal-Representative-Bishop-Elisaphane-1-KTBa2I1vy9HjjkzDw9SYXMjomZy4Gz.jpg"
                alt="AEBR Leadership"
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
              <p className="text-xs font-semibold text-primary mb-2">AEBR Leadership</p>
              <p className="text-foreground font-semibold mb-1">Bishop Elisaphane</p>
              <p className="text-xs text-foreground/60">Leading 200+ Churches Across Rwanda</p>
            </div>
          </div>
        </div>

        {/* Right — login form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 relative z-10 py-8">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">Welcome Back</h1>
              <p className="text-foreground/60">Sign in to your AEBR CMS account</p>
            </div>

            {/* Demo accounts — click to auto-fill */}
            <div className="bg-[#f8faf8] rounded-2xl p-4 border border-border">
              <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-3">
                Quick Login — Click any role
              </p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map(({ role, email: demoEmail, color }) => (
                  <button
                    key={demoEmail}
                    type="button"
                    onClick={() => fillDemo(demoEmail)}
                    className={`flex flex-col items-start px-3 py-2 rounded-xl text-xs font-semibold transition-all border-2
                      ${activeDemo === demoEmail
                        ? 'border-[#1a3a2a] shadow-md scale-[1.02] ' + color
                        : 'border-transparent bg-white hover:border-[#1a3a2a]/30 text-foreground hover:shadow-sm'
                      }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${activeDemo === demoEmail ? 'opacity-80' : 'text-foreground/50'}`}>
                      {role}
                    </span>
                    <span className={activeDemo === demoEmail ? 'opacity-90' : 'text-foreground/70'}>
                      {demoEmail}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-foreground/40 mt-3 text-center">
                All demo accounts use password: <span className="font-bold text-foreground/60">password123</span>
              </p>
            </div>

            {/* Login form */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setActiveDemo(null) }}
                    placeholder="your@church.com"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-[#1a3a2a] focus:ring-2 focus:ring-[#1a3a2a]/20 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-[#1a3a2a] focus:ring-2 focus:ring-[#1a3a2a]/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a3a2a] text-white hover:bg-[#1a3a2a]/90 font-semibold rounded-lg h-12 text-base transition-all hover:shadow-lg"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <div className="text-center text-foreground/50 mt-4">
                  <p className="text-sm">
                    Forgot your password?{' '}
                    <Link href="/forgot-password" className="font-medium text-[#1a3a2a] hover:text-primary transition-colors">
                      Reset it
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
