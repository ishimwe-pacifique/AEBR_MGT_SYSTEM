'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!verificationCode) {
      toast.error('Please enter the verification code')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/reset-password/${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          verificationCode,
          password 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      toast.success('Password has been reset. Please sign in with your new password.')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
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

        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 relative z-10 py-8">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">Reset Password</h1>
              <p className="text-foreground/60">
                Enter the verification code sent to your email and choose a new password.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/*
                  We'll add error/success messages via toast
                */}

                <div className="space-y-1.5">
                  <label htmlFor="verificationCode" className="block text-sm font-semibold text-foreground">
                    Verification Code
                  </label>
                  <input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-[#1a3a2a] focus:ring-2 focus:ring-[#1a3a2a]/20 transition-all"
                    required
                    maxLength={6}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Choose a strong password"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-[#1a3a2a] focus:ring-2 focus:ring-[#1a3a2a]/20 transition-all"
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-[#1a3a2a] focus:ring-2 focus:ring-[#1a3a2a]/20 transition-all"
                    required
                    minLength={8}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a3a2a] text-white hover:bg-[#1a3a2a]/90 font-semibold rounded-lg h-12 text-base transition-all hover:shadow-lg"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </div>

            <div className="text-center text-foreground/50">
              <p className="text-sm">
                Remember your password?{' '}
                <Link href="/login" className="font-medium text-[#1a3a2a] hover:text-primary transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}