import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Church } from '@/lib/models/Church'
import { Member } from '@/lib/models/Member'
import { Transaction } from '@/lib/models/Transaction'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'district_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const districtId = (session.user as any).districtId

  const churches = await Church.find({ district: districtId }).lean()
  const churchIds = churches.map(c => c._id)

  const [totalMembers, totalTransactions] = await Promise.all([
    Member.countDocuments({ church: { $in: churchIds } }),
    Transaction.find({ church: { $in: churchIds } }).lean(),
  ])

  const totalIncome = totalTransactions.filter(t => t.type !== 'expense').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = totalTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Per-church breakdown
  const churchBreakdown = await Promise.all(
    churches.map(async (church) => {
      const members = await Member.countDocuments({ church: church._id })
      const txs = await Transaction.find({ church: church._id }).lean()
      const income = txs.filter(t => t.type !== 'expense').reduce((s, t) => s + t.amount, 0)
      return { name: church.name, members, income }
    })
  )

  return NextResponse.json({
    stats: { totalChurches: churches.length, totalMembers, totalIncome, totalExpenses },
    churches: churchBreakdown,
  })
}
