import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Province } from '@/lib/models/Province'

export async function GET() {
  await connectDB()
  const provinces = await Province.find().sort({ name: 1 }).lean()
  return NextResponse.json({ provinces })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'national_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const { name, code } = await req.json()
  if (!name || !code) return NextResponse.json({ error: 'Name and code required' }, { status: 400 })

  const province = await Province.create({ name, code })
  return NextResponse.json({ province }, { status: 201 })
}
