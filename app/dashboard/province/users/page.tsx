'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import { navItems } from '../page'
import { UserPlus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

const roleOptions = ['pastor','registrar','accountant','district_admin']
const roleColors: Record<string, string> = {
  pastor: 'bg-[#1a3a2a] text-white', registrar: 'bg-blue-600 text-white',
  accountant: 'bg-[#c9a84c] text-[#1a3a2a]', district_admin: 'bg-purple-600 text-white',
}
const emptyForm = { name: '', email: '', password: '', userRole: 'pastor', churchId: '', districtId: '' }

export default function ProvinceUsersPage() {
  const { data: session } = useSession()
  const user = session?.user as any
  const [users, setUsers]       = useState<any[]>([])
  const [churches, setChurches] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')
  const [error, setError]       = useState('')

  const load = async () => {
    if (!user?.provinceId) return
    const [u, c, d] = await Promise.all([
      fetch('/api/manage/users').then(r => r.json()),
      fetch(`/api/manage/churches?province=${user.provinceId}`).then(r => r.json()),
      fetch(`/api/manage/districts?province=${user.provinceId}`).then(r => r.json()),
    ])
    setUsers(u.users ?? [])
    setChurches(c.churches ?? [])
    setDistricts(d.districts ?? [])
  }
  useEffect(() => { load() }, [user?.provinceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = { ...form, provinceId: user.provinceId }
    const res = await fetch('/api/manage/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error); return }
    setShowModal(false)
    setForm(emptyForm)
    load()
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'name',  label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role',  label: 'Role', render: (r: any) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${roleColors[r.role] ?? 'bg-gray-100 text-gray-600'}`}>
        {r.role?.replace('_',' ')}
      </span>
    )},
    { key: 'church', label: 'Church', render: (r: any) => r.church?.name ?? r.district?.name ?? '—' },
    { key: 'isActive', label: 'Status', render: (r: any) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
        {r.isActive ? 'Active' : 'Inactive'}
      </span>
    )},
  ]

  return (
    <DashboardLayout navItems={navItems} roleLabel="Province Admin" roleColor="bg-purple-600 text-white">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users in {user?.provinceName}</h1>
            <p className="text-foreground/60 mt-1">Manage church staff and district admins</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
            <UserPlus className="w-4 h-4 mr-2" /> Add User
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:border-[#1a3a2a] text-sm" />
        </div>

        <DataTable columns={columns} data={filtered} emptyMessage="No users found" />
      </div>

      {showModal && (
        <Modal title="Add User" onClose={() => { setShowModal(false); setError('') }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
            {[
              { name: 'name', label: 'Full Name', type: 'text' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'password', label: 'Password', type: 'password' },
            ].map(({ name, label, type }) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-foreground mb-1">{label}</label>
                <input type={type} value={(form as any)[name]}
                  onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required />
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Role</label>
              <select value={form.userRole} onChange={e => setForm(p => ({ ...p, userRole: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm">
                {roleOptions.map(r => <option key={r} value={r}>{r.replace('_',' ')}</option>)}
              </select>
            </div>
            {['pastor','registrar','accountant'].includes(form.userRole) && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Assign Church</label>
                <select value={form.churchId} onChange={e => setForm(p => ({ ...p, churchId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm">
                  <option value="">Select church...</option>
                  {churches.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            )}
            {form.userRole === 'district_admin' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Assign District</label>
                <select value={form.districtId} onChange={e => setForm(p => ({ ...p, districtId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm">
                  <option value="">Select district...</option>
                  {districts.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
                {saving ? 'Creating...' : 'Create User'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
