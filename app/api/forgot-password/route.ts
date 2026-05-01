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

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Hash the code for storage (similar to password hashing)
    const hashedCode = crypto.createHash('sha256').update(verificationCode).digest('hex')

    // Set verification code and expiry (10 minutes)
    user.resetPasswordToken = hashedCode
    user.resetPasswordExpires = new Date(Date.now() + 600000) // 10 minutes
    await user.save()

    // Send verification code email
    await sendVerificationCodeEmail(user.email, verificationCode)

    return NextResponse.json({ message: 'If an account exists with that email, you will receive a verification code shortly.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}