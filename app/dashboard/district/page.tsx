'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatCard from '@/components/dashboard/StatCard'
import DataTable from '@/components/dashboard/DataTable'
import { LayoutDashboard, Building2, Users, TrendingUp, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const navItems = [
  { label: 'Overview', href: '/dashboard/district', icon: LayoutDashboard },
  { label: 'Churches', href: '/dashboard/district', icon: Building2 },
  { label: 'Members', href: '/dashboard/district', icon: Users },
  { label: 'Finances', href: '/dashboard/district', icon: TrendingUp },
  { label: 'Reports', href: '/dashboard/district', icon: BarChart3 },
]

export default function DistrictDashboard() {
  const { data: session } = useSession()
  const user = session?.user as any
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/dashboard/district').then(r => r.json()).then(setData)
  }, [])

  const churchColumns = [
    { key: 'name', label: 'Church Name' },
    { key: 'members', label: 'Members' },
    { key: 'income', label: 'Income (RWF)', render: (r: any) => r.income.toLocaleString() },
  ]

  return (
    <DashboardLayout navItems={navItems} roleLabel="District Admin" roleColor="bg-blue-600 text-white">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">District Dashboard</h1>
          <p className="text-foreground/60 mt-1">{user?.districtName} District — {user?.provinceName}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Churches" value={data?.stats.totalChurches ?? '—'} icon={Building2} color="green" />
          <StatCard title="Total Members" value={data?.stats.totalMembers ?? '—'} icon={Users} color="gold" />
          <StatCard title="Total Income" value={`RWF ${(data?.stats.totalIncome ?? 0).toLocaleString()}`} icon={TrendingUp} color="blue" />
          <StatCard title="Total Expenses" value={`RWF ${(data?.stats.totalExpenses ?? 0).toLocaleString()}`} icon={TrendingUp} color="red" />
        </div>

        {data?.churches?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-6">Churches by Members</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.churches}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="members" fill="#1a3a2a" radius={[4, 4, 0, 0]} name="Members" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Church Breakdown</h2>
          <DataTable columns={churchColumns} data={data?.churches ?? []} emptyMessage="No churches in this district" />
        </div>
      </div>
    </DashboardLayout>
  )
}
