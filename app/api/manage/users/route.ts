import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import bcrypt from 'bcryptjs'

const adminRoles = ['national_admin', 'province_admin', 'district_admin']

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !adminRoles.includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const { searchParams } = new URL(req.url)
  const filterRole = searchParams.get('role')

  let query: any = {}

  // Province admin only sees church-level users in their province
  if (role === 'province_admin') {
    const provinceId = (session.user as any).provinceId
    query = { $or: [{ province: provinceId }, { church: { $exists: true } }] }
  }
  // District admin only sees church-level users in their district
  if (role === 'district_admin') {
    const districtId = (session.user as any).districtId
    query = { district: districtId }
  }

  if (filterRole) query.role = filterRole

  const users = await User.find(query)
    .populate('church', 'name')
    .populate('district', 'name')
    .populate('province', 'name')
    .select('-password')
    .lean()

  return NextResponse.json({ users })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !adminRoles.includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const body = await req.json()
  const { name, email, password, userRole, churchId, districtId, provinceId } = body

  if (!name || !email || !password || !userRole) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 10)
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hash,
    role: userRole,
    church: churchId || undefined,
    district: districtId || undefined,
    province: provinceId || undefined,
    isActive: true,
  })

  return NextResponse.json({ user: { ...user.toObject(), password: undefined } }, { status: 201 })
}
