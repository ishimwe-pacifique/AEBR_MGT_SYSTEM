import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Province } from '@/lib/models/Province'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const province = await Province.findById(id).lean()
  if (!province) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ province })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'national_admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const { id } = await params
  const body = await req.json()
  const province = await Province.findByIdAndUpdate(id, body, { new: true }).lean()
  if (!province) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ province })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'national_admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const { id } = await params
  await Province.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
