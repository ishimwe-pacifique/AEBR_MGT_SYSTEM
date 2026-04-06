import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Church } from '@/lib/models/Church'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const church = await Church.findById(id).populate('district', 'name').populate('province', 'name').lean()
  if (!church) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ church })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !['national_admin', 'province_admin', 'district_admin'].includes(role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const { id } = await params
  const body = await req.json()
  if (body.districtId) { body.district = body.districtId; delete body.districtId }
  if (body.provinceId) { body.province = body.provinceId; delete body.provinceId }
  const church = await Church.findByIdAndUpdate(id, body, { new: true })
    .populate('district', 'name').populate('province', 'name').lean()
  if (!church) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ church })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !['national_admin', 'province_admin', 'district_admin'].includes(role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const { id } = await params
  await Church.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
