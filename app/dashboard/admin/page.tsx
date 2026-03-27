'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatCard from '@/components/dashboard/StatCard'
import DataTable from '@/components/dashboard/DataTable'
import { LayoutDashboard, Building2, Users, TrendingUp, MapPin, Globe, DollarSign, BarChart3, Settings } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'

const navItems = [
  { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Provinces', href: '/dashboard/admin', icon: Globe },
  { label: 'Churches', href: '/dashboard/admin', icon: Building2 },
  { label: 'Members', href: '/dashboard/admin', icon: Users },
  { label: 'Finances', href: '/dashboard/admin', icon: TrendingUp },
  { label: 'Reports', href: '/dashboard/admin', icon: BarChart3 },
  { label: 'Settings', href: '/dashboard/admin', icon: Settings },
]

const PIE_COLORS = ['#1a3a2a', '#c9a84c', '#2d6a4f', '#e9c46a', '#264653']

export default function NationalAdminDashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/dashboard/admin').then(r => r.json()).then(setData)
  }, [])

  const provinceColumns = [
    { key: 'name', label: 'Province' },
    { key: 'churches', label: 'Churches' },
    { key: 'members', label: 'Members' },
    { key: 'income', label: 'Income (RWF)', render: (r: any) => r.income.toLocaleString() },
  ]

  return (
    <DashboardLayout navItems={navItems} roleLabel="National Admin" roleColor="bg-red-600 text-white">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">National Overview</h1>
          <p className="text-foreground/60 mt-1">AEBR — Association des Églises Baptistes au Rwanda</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Provinces" value={data?.stats.totalProvinces ?? '—'} icon={Globe} color="green" />
          <StatCard title="Districts" value={data?.stats.totalDistricts ?? '—'} icon={MapPin} color="gold" />
          <StatCard title="Churches" value={data?.stats.totalChurches ?? '—'} icon={Building2} color="blue" />
          <StatCard title="Total Members" value={data?.stats.totalMembers ?? '—'} icon={Users} color="green" trend={{ value: '15%', positive: true }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Total Income (RWF)" value={(data?.stats.totalIncome ?? 0).toLocaleString()} icon={TrendingUp} color="green" />
          <StatCard title="Total Expenses (RWF)" value={(data?.stats.totalExpenses ?? 0).toLocaleString()} icon={TrendingUp} color="red" />
          <StatCard title="Net Balance (RWF)" value={(data?.stats.balance ?? 0).toLocaleString()} icon={DollarSign} color="gold" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {data?.provinces?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-6">Members by Province</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.provinces}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="members" fill="#1a3a2a" radius={[4, 4, 0, 0]} name="Members" />
                  <Bar dataKey="churches" fill="#c9a84c" radius={[4, 4, 0, 0]} name="Churches" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {data?.provinces?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-6">Income Distribution</h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.provinces}
                    dataKey="income"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.provinces.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `RWF ${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Province Breakdown</h2>
          <DataTable columns={provinceColumns} data={data?.provinces ?? []} emptyMessage="No data available" />
        </div>
      </div>
    </DashboardLayout>
  )
}
