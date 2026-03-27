import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Church } from '@/lib/models/Church'
import { District } from '@/lib/models/District'
import { Member } from '@/lib/models/Member'
import { Transaction } from '@/lib/models/Transaction'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'province_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const provinceId = (session.user as any).provinceId

  const [districts, churches] = await Promise.all([
    District.find({ province: provinceId }).lean(),
    Church.find({ province: provinceId }).lean(),
  ])

  const churchIds = churches.map(c => c._id)

  const [totalMembers, transactions] = await Promise.all([
    Member.countDocuments({ church: { $in: churchIds } }),
    Transaction.find({ church: { $in: churchIds } }).lean(),
  ])

  const totalIncome = transactions.filter(t => t.type !== 'expense').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Per-district breakdown
  const districtBreakdown = await Promise.all(
    districts.map(async (district) => {
      const districtChurches = await Church.find({ district: district._id }).lean()
      const dChurchIds = districtChurches.map(c => c._id)
      const members = await Member.countDocuments({ church: { $in: dChurchIds } })
      const txs = await Transaction.find({ church: { $in: dChurchIds } }).lean()
      const income = txs.filter(t => t.type !== 'expense').reduce((s, t) => s + t.amount, 0)
      return { name: district.name, churches: districtChurches.length, members, income }
    })
  )

  return NextResponse.json({
    stats: { totalDistricts: districts.length, totalChurches: churches.length, totalMembers, totalIncome, totalExpenses },
    districts: districtBreakdown,
  })
}
