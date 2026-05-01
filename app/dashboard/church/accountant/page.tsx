'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatCard from '@/components/dashboard/StatCard'
import DataTable from '@/components/dashboard/DataTable'
import { LayoutDashboard, TrendingUp, TrendingDown, DollarSign, PlusCircle, BarChart3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const navItems = [
  { label: 'Overview',     href: '/dashboard/church/accountant', icon: LayoutDashboard },
  { label: 'Transactions', href: '/dashboard/church/accountant', icon: DollarSign },
  { label: 'Reports',      href: '/dashboard/church/accountant', icon: BarChart3 },
]

const today = () => new Date().toISOString().split('T')[0]

const emptyForm = {
  type: 'tithe',
  amount: '',
  date: today(),
  description: '',
  category: '',
  reference: '',
  memberId: '',
  memberSearch: '',
}

export default function AccountantDashboard() {
  const { data: session } = useSession()
  const user = session?.user as any

  const [data,    setData]    = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form,    setForm]    = useState(emptyForm)
  const [saving,  setSaving]  = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const load = () =>
    fetch('/api/dashboard/accountant').then(r => r.json()).then(setData)

  const loadMembers = () =>
    fetch('/api/dashboard/accountant/members')
      .then(r => r.json())
      .then(d => setMembers(d.members ?? []))

  useEffect(() => { load(); loadMembers() }, [])

  // Filter members by search text
  const filteredMembers = useMemo(() => {
    const q = form.memberSearch.toLowerCase()
    if (!q) return members.slice(0, 10)
    return members.filter(m =>
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
      (m.phone ?? '').includes(q)
    ).slice(0, 10)
  }, [form.memberSearch, members])

  const selectMember = (m: any) => {
    setForm(p => ({ ...p, memberId: m._id, memberSearch: `${m.firstName} ${m.lastName}`, }))
    setShowDropdown(false)
  }

  const clearMember = () => setForm(p => ({ ...p, memberId: '', memberSearch: '' }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload: any = {
      type:        form.type,
      amount:      Number(form.amount),
      date:        form.date,
      description: form.description,
      category:    form.category,
      reference:   form.reference,
    }
    if (form.memberId) payload.member = form.memberId
    await fetch('/api/dashboard/accountant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
    {
      key: 'member', label: 'Member',
      render: (r: any) =>
        r.member ? `${r.member.firstName} ${r.member.lastName}` : <span className="text-foreground/40 text-xs">—</span>,
    },
    { key: 'amount',      label: 'Amount (RWF)', render: (r: any) => r.amount.toLocaleString() },
    { key: 'category',    label: 'Category',    render: (r: any) => r.category   || '—' },
    { key: 'reference',   label: 'Reference',   render: (r: any) => r.reference  || '—' },
    { key: 'description', label: 'Description', render: (r: any) => r.description || '—' },
    { key: 'date',        label: 'Date',        render: (r: any) => new Date(r.date).toLocaleDateString() },
  ]

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-1">{label}</label>
      {children}
    </div>
  )

  const inputCls = 'w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-[#1a3a2a] text-sm'

  return (
    <DashboardLayout navItems={navItems} roleLabel="Accountant" roleColor="bg-[#c9a84c] text-[#1a3a2a]">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financial Management</h1>
            <p className="text-foreground/60 mt-1">{user?.churchName}</p>
          </div>
          <Button
            onClick={() => { setShowForm(!showForm); setForm(emptyForm) }}
            className="bg-[#c9a84c] hover:bg-[#c9a84c]/90 text-[#1a3a2a] font-semibold"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Record Transaction
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Income"   value={`RWF ${(data?.stats.totalIncome   ?? 0).toLocaleString()}`} icon={TrendingUp}   color="green" trend={{ value: '10%', positive: true }} />
          <StatCard title="Total Expenses" value={`RWF ${(data?.stats.totalExpenses ?? 0).toLocaleString()}`} icon={TrendingDown}  color="red" />
          <StatCard title="Balance"        value={`RWF ${(data?.stats.balance       ?? 0).toLocaleString()}`} icon={DollarSign}   color="gold" />
          <StatCard title="Tithes"         value={`RWF ${(data?.stats.tithes        ?? 0).toLocaleString()}`} icon={DollarSign}   color="blue" />
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
                <Bar dataKey="income"  fill="#1a3a2a" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#c9a84c" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Record Transaction Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Record New Transaction</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 text-foreground/50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Type */}
              <Field label="Transaction Type">
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className={inputCls}
                >
                  {['tithe', 'offering', 'donation', 'expense'].map(t => (
                    <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </Field>

              {/* Date */}
              <Field label="Date">
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className={inputCls}
                  required
                />
              </Field>

              {/* Amount */}
              <Field label="Amount (RWF)">
                <input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  className={inputCls}
                  placeholder="0"
                  required
                />
              </Field>

              {/* Category */}
              <Field label="Category">
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className={inputCls}
                  placeholder="e.g. Sunday Service, Building Fund"
                />
              </Field>

              {/* Member search */}
              <Field label="Member (optional)">
                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.memberSearch}
                      onChange={e => {
                        setForm(p => ({ ...p, memberSearch: e.target.value, memberId: '' }))
                        setShowDropdown(true)
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className={inputCls}
                      placeholder="Search by name or phone..."
                      autoComplete="off"
                    />
                    {form.memberId && (
                      <button type="button" onClick={clearMember} className="px-2 text-foreground/40 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {showDropdown && filteredMembers.length > 0 && !form.memberId && (
                    <ul className="absolute z-20 mt-1 w-full bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredMembers.map(m => (
                        <li
                          key={m._id}
                          onMouseDown={() => selectMember(m)}
                          className="px-4 py-2.5 hover:bg-[#1a3a2a]/5 cursor-pointer text-sm"
                        >
                          <span className="font-medium">{m.firstName} {m.lastName}</span>
                          {m.phone && <span className="ml-2 text-foreground/50 text-xs">{m.phone}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {form.memberId && (
                  <p className="text-xs text-green-600 mt-1">✓ Member selected</p>
                )}
              </Field>

              {/* Reference */}
              <Field label="Reference No.">
                <input
                  type="text"
                  value={form.reference}
                  onChange={e => setForm(p => ({ ...p, reference: e.target.value }))}
                  className={inputCls}
                  placeholder="e.g. REC-2024-001"
                />
              </Field>

              {/* Description */}
              <div className="sm:col-span-2">
                <Field label="Description / Notes">
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className={`${inputCls} resize-none`}
                    rows={2}
                    placeholder="Additional notes..."
                  />
                </Field>
              </div>

              <div className="sm:col-span-2 flex gap-3 pt-1">
                <Button type="submit" disabled={saving} className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
                  {saving ? 'Saving...' : 'Save Transaction'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {/* Transactions Table */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">All Transactions</h2>
          <DataTable
            columns={txColumns}
            data={data?.transactions ?? []}
            emptyMessage="No transactions recorded yet"
            searchPlaceholder="Search transactions..."
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
