import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Church } from '@/lib/models/Church'
import { District } from '@/lib/models/District'
import { Province } from '@/lib/models/Province'
import { Member } from '@/lib/models/Member'
import { Transaction } from '@/lib/models/Transaction'
import { User } from '@/lib/models/User'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'national_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const [provinces, districts, churches, totalMembers, totalUsers, transactions] = await Promise.all([
    Province.find().lean(),
    District.countDocuments(),
    Church.countDocuments(),
    Member.countDocuments(),
    User.countDocuments(),
    Transaction.find().lean(),
  ])

  const totalIncome = transactions.filter(t => t.type !== 'expense').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Per-province breakdown
  const provinceBreakdown = await Promise.all(
    provinces.map(async (province) => {
      const provChurches = await Church.find({ province: province._id }).lean()
      const churchIds = provChurches.map(c => c._id)
      const members = await Member.countDocuments({ church: { $in: churchIds } })
      const txs = await Transaction.find({ church: { $in: churchIds } }).lean()
      const income = txs.filter(t => t.type !== 'expense').reduce((s, t) => s + t.amount, 0)
      return { name: province.name, churches: provChurches.length, members, income }
    })
  )

  return NextResponse.json({
    stats: {
      totalProvinces: provinces.length,
      totalDistricts: districts,
      totalChurches: churches,
      totalMembers,
      totalUsers,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    },
    provinces: provinceBreakdown,
  })
}
