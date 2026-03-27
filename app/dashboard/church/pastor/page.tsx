'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatCard from '@/components/dashboard/StatCard'
import DataTable from '@/components/dashboard/DataTable'
import { LayoutDashboard, Users, TrendingUp, BookOpen, Calendar } from 'lucide-react'

const navItems = [
  { label: 'Overview', href: '/dashboard/church/pastor', icon: LayoutDashboard },
  { label: 'Members', href: '/dashboard/church/pastor/members', icon: Users },
  { label: 'Finances', href: '/dashboard/church/pastor/finances', icon: TrendingUp },
  { label: 'Ministries', href: '/dashboard/church/pastor/ministries', icon: BookOpen },
  { label: 'Events', href: '/dashboard/church/pastor/events', icon: Calendar },
]

export default function PastorDashboard() {
  const { data: session } = useSession()
  const user = session?.user as any
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/dashboard/pastor').then(r => r.json()).then(setData)
  }, [])

  const memberColumns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'ministry', label: 'Ministry' },
    {
      key: 'isActive', label: 'Status',
      render: (row: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ]

  return (
    <DashboardLayout navItems={navItems} roleLabel="Pastor" roleColor="bg-[#1a3a2a] text-white">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name} 👋</h1>
          <p className="text-foreground/60 mt-1">{user?.churchName} — Church Overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Members" value={data?.stats.totalMembers ?? '—'} icon={Users} color="green" trend={{ value: '12%', positive: true }} />
          <StatCard title="Active Members" value={data?.stats.activeMembers ?? '—'} icon={Users} color="gold" />
          <StatCard title="Staff & Leaders" value={data?.stats.totalStaff ?? '—'} icon={BookOpen} color="blue" />
          <StatCard title="Total Income (RWF)" value={data?.stats.totalIncome ? data.stats.totalIncome.toLocaleString() : '—'} icon={TrendingUp} color="green" trend={{ value: '8%', positive: true }} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Members</h2>
          <DataTable columns={memberColumns} data={data?.recentMembers ?? []} emptyMessage="No members yet" />
        </div>
      </div>
    </DashboardLayout>
  )
}
