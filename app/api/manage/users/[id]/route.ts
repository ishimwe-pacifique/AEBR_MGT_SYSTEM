import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import bcrypt from 'bcryptjs'

const adminRoles = ['national_admin', 'province_admin', 'district_admin']

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || !adminRoles.includes((session.user as any)?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await connectDB()
  const { id } = await params
  const user = await User.findById(id)
    .populate('church', 'name')
    .populate('district', 'name')
    .populate('province', 'name')
    .lean()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  // Return with masked password for display
  return NextResponse.json({ user: { ...user, password: '••••••••' } })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || !adminRoles.includes((session.user as any)?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await connectDB()
  const { id } = await params
  const body = await req.json()

  // Only hash if a real new password was provided (not the masked placeholder)
  if (body.password && body.password !== '••••••••') {
    body.password = await bcrypt.hash(body.password, 10)
  } else {
    delete body.password
  }

  // Map role fields
  if (body.churchId !== undefined)   { body.church   = body.churchId   || undefined; delete body.churchId }
  if (body.districtId !== undefined) { body.district = body.districtId || undefined; delete body.districtId }
  if (body.provinceId !== undefined) { body.province = body.provinceId || undefined; delete body.provinceId }
  if (body.userRole !== undefined)   { body.role     = body.userRole;                delete body.userRole }

  const user = await User.findByIdAndUpdate(id, body, { new: true })
    .populate('church', 'name')
    .populate('district', 'name')
    .populate('province', 'name')
    .select('-password')
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'national_admin') {
    return NextResponse.json({ error: 'Only national admin can delete users' }, { status: 401 })
  }
  await connectDB()
  const { id } = await params
  await User.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
