import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { District } from '@/lib/models/District'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const district = await District.findById(id).populate('province', 'name').lean()
  if (!district) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ district })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !['national_admin', 'province_admin'].includes(role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const { id } = await params
  const body = await req.json()
  if (body.provinceId) { body.province = body.provinceId; delete body.provinceId }
  const district = await District.findByIdAndUpdate(id, body, { new: true }).populate('province', 'name').lean()
  if (!district) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ district })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !['national_admin', 'province_admin'].includes(role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const { id } = await params
  await District.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
