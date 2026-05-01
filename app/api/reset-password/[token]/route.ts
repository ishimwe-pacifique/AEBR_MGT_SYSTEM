import { NextResponse } from 'next/server'
import { User } from '@/lib/models/User'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { connectDB } from '@/lib/mongodb'

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB()
    
    const { verificationCode, password } = await request.json()
    const token = params.token

    // Find user by token (email) and check expiry
    const user = await User.findOne({
      resetPasswordToken: { $exists: true },
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Hash the verification code to compare with database
    const hashedVerificationCode = crypto.createHash('sha256').update(verificationCode).digest('hex')

    // Check if verification code matches
    if (hashedVerificationCode !== user.resetPasswordToken) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    // Clear verification code fields
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return NextResponse.json({ message: 'Password has been reset.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}