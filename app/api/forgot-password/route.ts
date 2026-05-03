import { NextResponse } from 'next/server'
import { User } from '@/lib/models/User'
import crypto from 'crypto'
import { sendVerificationCodeEmail } from '@/lib/email'
import { connectDB } from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    await connectDB()
    
    const { email } = await request.json()
    const user = await User.findOne({ email: email.toLowerCase().trim() })

    if (!user) {
      // Don't reveal that the email doesn't exist
      return NextResponse.json({ message: 'If an account exists with that email, you will receive a verification code shortly.' })
    }

    // Generate random token for URL
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Generate 6-digit verification code for email
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Hash the verification code for storage
    const hashedVerificationCode = crypto.createHash('sha256').update(verificationCode).digest('hex')

    // Set token (for URL identification), code (for validation), and expiry (10 minutes)
    user.resetPasswordToken = hashedToken // This is for finding the user via URL
    user.verificationCode = hashedVerificationCode // This is for validating the code from email
    user.resetPasswordExpires = new Date(Date.now() + 600000) // 10 minutes
    await user.save()

    // Send verification code email
    await sendVerificationCodeEmail(user.email, verificationCode)

    // Return the reset token in the response so we can redirect to the reset page
    return NextResponse.json({ 
      message: 'If an account exists with that email, you will receive a verification code shortly.',
      resetToken // Send back the unhashed token for redirect
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}