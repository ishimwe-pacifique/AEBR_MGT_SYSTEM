'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatCard from '@/components/dashboard/StatCard'
import DataTable from '@/components/dashboard/DataTable'
import { LayoutDashboard, Users, UserPlus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { label: 'Overview', href: '/dashboard/church/registrar', icon: LayoutDashboard },
  { label: 'All Members', href: '/dashboard/church/registrar', icon: Users },
  { label: 'Add Member', href: '/dashboard/church/registrar', icon: UserPlus },
  { label: 'Reports', href: '/dashboard/church/registrar', icon: FileText },
]

const emptyForm = { firstName: '', lastName: '', email: '', phone: '', gender: 'male', ministry: '', baptized: false }

export default function RegistrarDashboard() {
  const { data: session } = useSession()
  const user = session?.user as any
  const [data, setData] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => fetch('/api/dashboard/registrar').then(r => r.json()).then(setData)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/dashboard/registrar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    setShowForm(false)
    setForm(emptyForm)
    load()
  }

  const memberColumns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'ministry', label: 'Ministry' },
    { key: 'gender', label: 'Gender', render: (r: any) => <span className="capitalize">{r.gender}</span> },
    {
      key: 'baptized', label: 'Baptized',
      render: (r: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.baptized ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {r.baptized ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'isActive', label: 'Status',
      render: (r: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ]

  return (
    <DashboardLayout navItems={navItems} roleLabel="Registrar" roleColor="bg-blue-600 text-white">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Member Registry</h1>
            <p className="text-foreground/60 mt-1">{user?.churchName}</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
            <UserPlus className="w-4 h-4 mr-2" /> Add Member
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Members" value={data?.stats.totalMembers ?? '—'} icon={Users} color="green" />
          <StatCard title="Active" value={data?.stats.activeMembers ?? '—'} icon={Users} color="gold" />
          <StatCard title="Baptized" value={data?.stats.baptizedMembers ?? '—'} icon={Users} color="blue" />
          <StatCard title="Male / Female" value={`${data?.stats.maleCount ?? 0} / ${data?.stats.femaleCount ?? 0}`} icon={Users} color="green" />
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Register New Member</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'firstName', label: 'First Name', type: 'text' },
                { name: 'lastName', label: 'Last Name', type: 'text' },
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'phone', label: 'Phone', type: 'tel' },
                { name: 'ministry', label: 'Ministry', type: 'text' },
              ].map(({ name, label, type }) => (
                <div key={name}>
                  <label className="block text-sm font-semibold text-foreground mb-1">{label}</label>
                  <input
                    type={type}
                    value={(form as any)[name]}
                    onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-[#1a3a2a] transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-[#1a3a2a]"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="baptized"
                  checked={form.baptized}
                  onChange={e => setForm(p => ({ ...p, baptized: e.target.checked }))}
                  className="w-4 h-4 accent-[#1a3a2a]"
                />
                <label htmlFor="baptized" className="text-sm font-medium text-foreground">Baptized</label>
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
                  {saving ? 'Saving...' : 'Save Member'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">All Members ({data?.members?.length ?? 0})</h2>
          <DataTable columns={memberColumns} data={data?.members ?? []} emptyMessage="No members registered yet" />
        </div>
      </div>
    </DashboardLayout>
  )
}
