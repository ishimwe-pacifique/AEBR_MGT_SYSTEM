'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatCard from '@/components/dashboard/StatCard'
import DataTable from '@/components/dashboard/DataTable'
import { LayoutDashboard, TrendingUp, TrendingDown, DollarSign, PlusCircle, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const navItems = [
  { label: 'Overview', href: '/dashboard/church/accountant', icon: LayoutDashboard },
  { label: 'Transactions', href: '/dashboard/church/accountant', icon: DollarSign },
  { label: 'Reports', href: '/dashboard/church/accountant', icon: BarChart3 },
]

const emptyForm = { type: 'tithe', amount: '', description: '', category: '' }

export default function AccountantDashboard() {
  const { data: session } = useSession()
  const user = session?.user as any
  const [data, setData] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => fetch('/api/dashboard/accountant').then(r => r.json()).then(setData)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/dashboard/accountant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    })
    setSaving(false)
    setShowForm(false)
    setForm(emptyForm)
    load()
  }

  const txColumns = [
    {
      key: 'type', label: 'Type',
      render: (r: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
          ${r.type === 'expense' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {r.type}
        </span>
      ),
    },
    { key: 'amount', label: 'Amount (RWF)', render: (r: any) => r.amount.toLocaleString() },
    { key: 'description', label: 'Description' },
    { key: 'date', label: 'Date', render: (r: any) => new Date(r.date).toLocaleDateString() },
  ]

  return (
    <DashboardLayout navItems={navItems} roleLabel="Accountant" roleColor="bg-[#c9a84c] text-[#1a3a2a]">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financial Management</h1>
            <p className="text-foreground/60 mt-1">{user?.churchName}</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#c9a84c] hover:bg-[#c9a84c]/90 text-[#1a3a2a] font-semibold">
            <PlusCircle className="w-4 h-4 mr-2" /> Record Transaction
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Income" value={`RWF ${(data?.stats.totalIncome ?? 0).toLocaleString()}`} icon={TrendingUp} color="green" trend={{ value: '10%', positive: true }} />
          <StatCard title="Total Expenses" value={`RWF ${(data?.stats.totalExpenses ?? 0).toLocaleString()}`} icon={TrendingDown} color="red" />
          <StatCard title="Balance" value={`RWF ${(data?.stats.balance ?? 0).toLocaleString()}`} icon={DollarSign} color="gold" />
          <StatCard title="Tithes" value={`RWF ${(data?.stats.tithes ?? 0).toLocaleString()}`} icon={DollarSign} color="blue" />
        </div>

        {/* Chart */}
        {data?.chartData?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-6">Monthly Income vs Expenses</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => `RWF ${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="income" fill="#1a3a2a" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#c9a84c" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Record New Transaction</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-[#1a3a2a]"
                >
                  {['tithe', 'offering', 'donation', 'expense'].map(t => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Amount (RWF)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-[#1a3a2a]"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-[#1a3a2a]"
                />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <Button type="submit" disabled={saving} className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
                  {saving ? 'Saving...' : 'Save Transaction'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">All Transactions</h2>
          <DataTable columns={txColumns} data={data?.transactions ?? []} emptyMessage="No transactions recorded yet" />
        </div>
      </div>
    </DashboardLayout>
  )
}
