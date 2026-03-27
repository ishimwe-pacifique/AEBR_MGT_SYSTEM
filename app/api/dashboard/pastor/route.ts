import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Member } from '@/lib/models/Member'
import { Transaction } from '@/lib/models/Transaction'
import { User } from '@/lib/models/User'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'pastor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const churchId = (session.user as any).churchId

  const [totalMembers, activeMembers, totalStaff, recentMembers, transactions] = await Promise.all([
    Member.countDocuments({ church: churchId }),
    Member.countDocuments({ church: churchId, isActive: true }),
    User.countDocuments({ church: churchId }),
    Member.find({ church: churchId }).sort({ createdAt: -1 }).limit(5).lean(),
    Transaction.find({ church: churchId }).sort({ date: -1 }).limit(6).lean(),
  ])

  const totalIncome = transactions
    .filter(t => t.type !== 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return NextResponse.json({
    stats: { totalMembers, activeMembers, totalStaff, totalIncome },
    recentMembers,
    recentTransactions: transactions,
  })
}
