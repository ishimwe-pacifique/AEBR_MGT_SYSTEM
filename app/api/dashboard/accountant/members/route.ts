import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Member } from '@/lib/models/Member'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'accountant') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const churchId = (session.user as any).churchId
  const members = await Member.find({ church: churchId, isActive: true })
    .select('firstName lastName phone')
    .sort({ firstName: 1 })
    .lean()

  return NextResponse.json({ members })
}
