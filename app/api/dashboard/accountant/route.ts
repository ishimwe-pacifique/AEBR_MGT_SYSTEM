import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Transaction } from '@/lib/models/Transaction'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'accountant') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const churchId = (session.user as any).churchId

  const transactions = await Transaction.find({ church: churchId })
    .populate('member', 'firstName lastName')
    .sort({ date: -1 })
    .lean()

  const totalIncome = transactions.filter(t => t.type !== 'expense').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const tithes = transactions.filter(t => t.type === 'tithe').reduce((s, t) => s + t.amount, 0)
  const offerings = transactions.filter(t => t.type === 'offering').reduce((s, t) => s + t.amount, 0)
  const donations = transactions.filter(t => t.type === 'donation').reduce((s, t) => s + t.amount, 0)

  // Monthly chart data
  const monthlyMap: Record<string, { income: number; expense: number }> = {}
  transactions.forEach(t => {
    const key = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' })
    if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 }
    if (t.type === 'expense') monthlyMap[key].expense += t.amount
    else monthlyMap[key].income += t.amount
  })
  const chartData = Object.entries(monthlyMap).map(([month, v]) => ({ month, ...v }))

  return NextResponse.json({
    transactions,
    stats: { totalIncome, totalExpenses, balance: totalIncome - totalExpenses, tithes, offerings, donations },
    chartData,
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'accountant') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const churchId = (session.user as any).churchId
  const userId = (session.user as any).id
  const body = await req.json()

  const tx = await Transaction.create({ ...body, church: churchId, recordedBy: userId })
  return NextResponse.json(tx, { status: 201 })
}
