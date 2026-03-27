import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Member } from '@/lib/models/Member'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'registrar') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const churchId = (session.user as any).churchId

  const [members, totalMembers, activeMembers, baptizedMembers, maleCount, femaleCount] = await Promise.all([
    Member.find({ church: churchId }).sort({ createdAt: -1 }).lean(),
    Member.countDocuments({ church: churchId }),
    Member.countDocuments({ church: churchId, isActive: true }),
    Member.countDocuments({ church: churchId, baptized: true }),
    Member.countDocuments({ church: churchId, gender: 'male' }),
    Member.countDocuments({ church: churchId, gender: 'female' }),
  ])

  return NextResponse.json({
    members,
    stats: { totalMembers, activeMembers, baptizedMembers, maleCount, femaleCount },
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'registrar') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const churchId = (session.user as any).churchId
  const body = await req.json()

  const member = await Member.create({ ...body, church: churchId })
  return NextResponse.json(member, { status: 201 })
}
