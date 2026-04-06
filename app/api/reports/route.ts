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

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'national_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const { searchParams } = new URL(req.url)
  const type       = searchParams.get('type') ?? 'overview'
  const provinceId = searchParams.get('province') ?? ''
  const dateFrom   = searchParams.get('from') ?? ''
  const dateTo     = searchParams.get('to') ?? ''

  const dateFilter: any = {}
  if (dateFrom) dateFilter.$gte = new Date(dateFrom)
  if (dateTo)   dateFilter.$lte = new Date(new Date(dateTo).setHours(23, 59, 59))

  // ── OVERVIEW REPORT ──────────────────────────────────────────
  if (type === 'overview') {
    const [provinces, totalDistricts, totalChurches, totalMembers, totalUsers, allTx] = await Promise.all([
      Province.find().lean(),
      District.countDocuments(),
      Church.countDocuments(),
      Member.countDocuments(),
      User.countDocuments({ isActive: true }),
      Transaction.find(dateFrom || dateTo ? { date: dateFilter } : {}).lean(),
    ])

    const totalIncome   = allTx.filter(t => t.type !== 'expense').reduce((s, t) => s + t.amount, 0)
    const totalExpenses = allTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const tithes        = allTx.filter(t => t.type === 'tithe').reduce((s, t) => s + t.amount, 0)
    const offerings     = allTx.filter(t => t.type === 'offering').reduce((s, t) => s + t.amount, 0)
    const donations     = allTx.filter(t => t.type === 'donation').reduce((s, t) => s + t.amount, 0)

    const provinceBreakdown = await Promise.all(
      provinces.map(async (prov) => {
        const churches  = await Church.find({ province: prov._id }).lean()
        const churchIds = churches.map(c => c._id)
        const members   = await Member.countDocuments({ church: { $in: churchIds } })
        const txs       = await Transaction.find({ church: { $in: churchIds }, ...(dateFrom || dateTo ? { date: dateFilter } : {}) }).lean()
        const income    = txs.filter(t => t.type !== 'expense').reduce((s, t) => s + t.amount, 0)
        const expenses  = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
        return { name: prov.name, churches: churches.length, members, income, expenses, balance: income - expenses }
      })
    )

    // Monthly trend (last 12 months)
    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const d    = new Date()
      d.setMonth(d.getMonth() - (11 - i))
      const y    = d.getFullYear()
      const m    = d.getMonth()
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      const txMonth = allTx.filter(t => {
        const td = new Date(t.date)
        return td.getFullYear() === y && td.getMonth() === m
      })
      return {
        month: label,
        income:   txMonth.filter(t => t.type !== 'expense').reduce((s, t) => s + t.amount, 0),
        expenses: txMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      }
    })

    return NextResponse.json({
      type: 'overview',
      generatedAt: new Date().toISOString(),
      stats: { totalProvinces: provinces.length, totalDistricts, totalChurches, totalMembers, totalUsers, totalIncome, totalExpenses, balance: totalIncome - totalExpenses, tithes, offerings, donations },
      provinceBreakdown,
      monthlyTrend,
    })
  }

  // ── MEMBERSHIP REPORT ────────────────────────────────────────
  if (type === 'membership') {
    const churchQuery: any = provinceId ? { province: provinceId } : {}
    const churches  = await Church.find(churchQuery).populate('province', 'name').populate('district', 'name').lean()
    const churchIds = churches.map(c => c._id)

    const memberQuery: any = { church: { $in: churchIds } }
    if (dateFrom || dateTo) memberQuery.joinDate = dateFilter

    const members = await Member.find(memberQuery).populate('church', 'name').lean()

    const total    = members.length
    const active   = members.filter(m => m.isActive).length
    const baptized = members.filter(m => m.baptized).length
    const male     = members.filter(m => m.gender === 'male').length
    const female   = members.filter(m => m.gender === 'female').length

    // Ministry breakdown
    const ministryMap: Record<string, number> = {}
    members.forEach(m => { if (m.ministry) ministryMap[m.ministry] = (ministryMap[m.ministry] ?? 0) + 1 })
    const ministryBreakdown = Object.entries(ministryMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)

    // Per-church breakdown
    const churchBreakdown = churches.map(c => {
      const cm = members.filter(m => String((m.church as any)?._id ?? m.church) === String(c._id))
      return {
        church:   c.name,
        province: (c.province as any)?.name ?? '—',
        district: (c.district as any)?.name ?? '—',
        total:    cm.length,
        active:   cm.filter(m => m.isActive).length,
        baptized: cm.filter(m => m.baptized).length,
        male:     cm.filter(m => m.gender === 'male').length,
        female:   cm.filter(m => m.gender === 'female').length,
      }
    }).filter(c => c.total > 0)

    // Monthly join trend
    const joinTrend = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (11 - i))
      const y = d.getFullYear(); const mo = d.getMonth()
      return {
        month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        joined: members.filter(m => { const jd = new Date(m.joinDate); return jd.getFullYear() === y && jd.getMonth() === mo }).length,
      }
    })

    return NextResponse.json({
      type: 'membership', generatedAt: new Date().toISOString(),
      stats: { total, active, inactive: total - active, baptized, male, female, baptismRate: total ? Math.round((baptized / total) * 100) : 0 },
      churchBreakdown, ministryBreakdown, joinTrend,
    })
  }

  // ── FINANCIAL REPORT ─────────────────────────────────────────
  if (type === 'financial') {
    const churchQuery: any = provinceId ? { province: provinceId } : {}
    const churches  = await Church.find(churchQuery).populate('province', 'name').populate('district', 'name').lean()
    const churchIds = churches.map(c => c._id)

    const txQuery: any = { church: { $in: churchIds } }
    if (dateFrom || dateTo) txQuery.date = dateFilter
    const transactions = await Transaction.find(txQuery).populate('church', 'name').sort({ date: -1 }).lean()

    const totalIncome   = transactions.filter(t => t.type !== 'expense').reduce((s, t) => s + t.amount, 0)
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const tithes        = transactions.filter(t => t.type === 'tithe').reduce((s, t) => s + t.amount, 0)
    const offerings     = transactions.filter(t => t.type === 'offering').reduce((s, t) => s + t.amount, 0)
    const donations     = transactions.filter(t => t.type === 'donation').reduce((s, t) => s + t.amount, 0)

    // Per-church financial breakdown
    const churchBreakdown = churches.map(c => {
      const ct = transactions.filter(t => String((t.church as any)?._id ?? t.church) === String(c._id))
      const income   = ct.filter(t => t.type !== 'expense').reduce((s, t) => s + t.amount, 0)
      const expenses = ct.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      return { church: c.name, province: (c.province as any)?.name ?? '—', district: (c.district as any)?.name ?? '—', income, expenses, balance: income - expenses, transactions: ct.length }
    }).filter(c => c.transactions > 0).sort((a, b) => b.income - a.income)

    // Monthly trend
    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (11 - i))
      const y = d.getFullYear(); const mo = d.getMonth()
      const mt = transactions.filter(t => { const td = new Date(t.date); return td.getFullYear() === y && td.getMonth() === mo })
      return {
        month:    d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        income:   mt.filter(t => t.type !== 'expense').reduce((s, t) => s + t.amount, 0),
        expenses: mt.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        tithes:   mt.filter(t => t.type === 'tithe').reduce((s, t) => s + t.amount, 0),
        offerings:mt.filter(t => t.type === 'offering').reduce((s, t) => s + t.amount, 0),
      }
    })

    // Type breakdown for pie
    const typeBreakdown = [
      { name: 'Tithes',   value: tithes,   color: '#1a3a2a' },
      { name: 'Offerings',value: offerings, color: '#c9a84c' },
      { name: 'Donations',value: donations, color: '#2d6a4f' },
      { name: 'Expenses', value: totalExpenses, color: '#e74c3c' },
    ].filter(t => t.value > 0)

    return NextResponse.json({
      type: 'financial', generatedAt: new Date().toISOString(),
      stats: { totalIncome, totalExpenses, balance: totalIncome - totalExpenses, tithes, offerings, donations, totalTransactions: transactions.length },
      churchBreakdown, monthlyTrend, typeBreakdown,
      recentTransactions: transactions.slice(0, 20).map(t => ({
        date: t.date, type: t.type, amount: t.amount, description: t.description,
        church: (t.church as any)?.name ?? '—',
      })),
    })
  }

  // ── CHURCH REPORT ────────────────────────────────────────────
  if (type === 'churches') {
    const churchQuery: any = provinceId ? { province: provinceId } : {}
    const churches = await Church.find(churchQuery)
      .populate('province', 'name').populate('district', 'name').lean()

    const active   = churches.filter(c => c.isActive).length
    const inactive = churches.filter(c => !c.isActive).length

    // Per-province breakdown
    const provinces = await Province.find().lean()
    const provinceBreakdown = await Promise.all(
      provinces.map(async prov => {
        const pc = churches.filter(c => String((c.province as any)?._id ?? c.province) === String(prov._id))
        const members = await Member.countDocuments({ church: { $in: pc.map(c => c._id) } })
        return { province: prov.name, total: pc.length, active: pc.filter(c => c.isActive).length, members }
      })
    ).then(r => r.filter(p => p.total > 0))

    const churchList = churches.map(c => ({
      name:        c.name,
      province:    (c.province as any)?.name ?? c.provinceName ?? '—',
      district:    (c.district as any)?.name ?? c.districtName ?? '—',
      sector:      c.sector ?? '—',
      cell:        c.cell   ?? '—',
      village:     c.village ?? '—',
      phone:       c.phone  ?? '—',
      email:       c.email  ?? '—',
      foundedYear: c.foundedYear ?? '—',
      status:      c.isActive ? 'Active' : 'Inactive',
    }))

    return NextResponse.json({
      type: 'churches', generatedAt: new Date().toISOString(),
      stats: { total: churches.length, active, inactive },
      provinceBreakdown, churchList,
    })
  }

  return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
}
