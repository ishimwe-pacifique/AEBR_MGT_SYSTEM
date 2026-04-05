'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatCard from '@/components/dashboard/StatCard'
import DataTable from '@/components/dashboard/DataTable'
import { LayoutDashboard, Building2, Users, TrendingUp, MapPin, BarChart3, UserCog } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export const navItems = [
  { label: 'Overview',  href: '/dashboard/province',           icon: LayoutDashboard },
  { label: 'Districts', href: '/dashboard/province/districts', icon: MapPin },
  { label: 'Churches',  href: '/dashboard/province/churches',  icon: Building2 },
  { label: 'Users',     href: '/dashboard/province/users',     icon: UserCog },
  { label: 'Members',   href: '/dashboard/province',           icon: Users },
  { label: 'Finances',  href: '/dashboard/province',           icon: TrendingUp },
  { label: 'Reports',   href: '/dashboard/province',           icon: BarChart3 },
]

export default function ProvinceDashboard() {
  const { data: session } = useSession()
  const user = session?.user as any
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/dashboard/province').then(r => r.json()).then(setData)
  }, [])

  const districtColumns = [
    { key: 'name',     label: 'District' },
    { key: 'churches', label: 'Churches' },
    { key: 'members',  label: 'Members' },
    { key: 'income',   label: 'Income (RWF)', render: (r: any) => r.income.toLocaleString() },
  ]

  return (
    <DashboardLayout navItems={navItems} roleLabel="Province Admin" roleColor="bg-purple-600 text-white">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Province Dashboard</h1>
          <p className="text-foreground/60 mt-1">{user?.provinceName}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard title="Districts" value={data?.stats.totalDistricts ?? '—'} icon={MapPin}    color="green" />
          <StatCard title="Churches"  value={data?.stats.totalChurches  ?? '—'} icon={Building2} color="gold" />
          <StatCard title="Members"   value={data?.stats.totalMembers   ?? '—'} icon={Users}     color="blue" />
          <StatCard title="Income"    value={(data?.stats.totalIncome   ?? 0).toLocaleString()} icon={TrendingUp} color="green" />
          <StatCard title="Expenses"  value={(data?.stats.totalExpenses ?? 0).toLocaleString()} icon={TrendingUp} color="red" />
        </div>

        {data?.districts?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Districts Comparison</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.districts}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="members"  fill="#1a3a2a" radius={[4,4,0,0]} name="Members" />
                <Bar dataKey="churches" fill="#c9a84c" radius={[4,4,0,0]} name="Churches" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-4">District Breakdown</h2>
          <DataTable columns={districtColumns} data={data?.districts ?? []} emptyMessage="No districts found" />
        </div>
      </div>
    </DashboardLayout>
  )
}
