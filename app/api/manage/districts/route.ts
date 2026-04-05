import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { District } from '@/lib/models/District'

export async function GET(req: Request) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const provinceId = searchParams.get('province')

  const query = provinceId ? { province: provinceId } : {}
  const districts = await District.find(query).populate('province', 'name').sort({ name: 1 }).lean()
  return NextResponse.json({ districts })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !['national_admin', 'province_admin'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const { name, provinceId } = await req.json()
  if (!name || !provinceId) return NextResponse.json({ error: 'Name and province required' }, { status: 400 })

  const district = await District.create({ name, province: provinceId })
  const populated = await district.populate('province', 'name')
  return NextResponse.json({ district: populated }, { status: 201 })
}
