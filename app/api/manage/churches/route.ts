import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Church } from '@/lib/models/Church'

export async function GET(req: Request) {
  await connectDB()
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  const { searchParams } = new URL(req.url)
  const districtId = searchParams.get('district')
  const provinceId = searchParams.get('province')

  let query: any = {}
  if (role === 'district_admin') query.district = (session?.user as any).districtId
  else if (role === 'province_admin') query.province = (session?.user as any).provinceId
  else if (districtId) query.district = districtId
  else if (provinceId) query.province = provinceId

  const churches = await Church.find(query)
    .populate('district', 'name')
    .populate('province', 'name')
    .sort({ name: 1 })
    .lean()

  return NextResponse.json({ churches })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !['national_admin', 'province_admin', 'district_admin'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const body = await req.json()
  const { name, districtId, provinceId, provinceName, districtName, sector, cell, village, address, phone, email, foundedYear } = body

  if (!name || !districtId || !provinceId) {
    return NextResponse.json({ error: 'Name, district and province are required' }, { status: 400 })
  }

  const church = await Church.create({
    name, district: districtId, province: provinceId,
    provinceName, districtName, sector, cell, village,
    address, phone, email, foundedYear: foundedYear ? Number(foundedYear) : undefined,
  })

  const populated = await Church.findById(church._id)
    .populate('district', 'name')
    .populate('province', 'name')
    .lean()

  return NextResponse.json({ church: populated }, { status: 201 })
}
