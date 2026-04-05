'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Modal from '@/components/dashboard/Modal'
import { navItems } from '../page'
import { UserPlus, Search, Eye, Pencil, Trash2, ShieldOff, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const roleOptions = ['pastor', 'registrar', 'accountant', 'district_admin', 'province_admin', 'national_admin']

const roleColors: Record<string, string> = {
  pastor:         'bg-[#1a3a2a] text-white',
  registrar:      'bg-blue-600 text-white',
  accountant:     'bg-[#c9a84c] text-[#1a3a2a]',
  district_admin: 'bg-purple-600 text-white',
  province_admin: 'bg-orange-600 text-white',
  national_admin: 'bg-red-600 text-white',
}

const emptyForm = {
  name: '', email: '', password: '', userRole: 'pastor',
  churchId: '', districtId: '', provinceId: '',
}

type ModalMode = 'create' | 'edit' | 'view' | null

export default function AdminUsersPage() {
  const [users, setUsers]         = useState<any[]>([])
  const [churches, setChurches]   = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [provinces, setProvinces] = useState<any[]>([])
  const [mode, setMode]           = useState<ModalMode>(null)
  const [selected, setSelected]   = useState<any>(null)
  const [form, setForm]           = useState(emptyForm)
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [search, setSearch]       = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [error, setError]         = useState('')
  const [confirmDelete, setConfirmDelete] = useState<any>(null)

  const load = async () => {
    const url = filterRole ? `/api/manage/users?role=${filterRole}` : '/api/manage/users'
    const [u, c, d, p] = await Promise.all([
      fetch(url).then(r => r.json()),
      fetch('/api/manage/churches').then(r => r.json()),
      fetch('/api/manage/districts').then(r => r.json()),
      fetch('/api/manage/provinces').then(r => r.json()),
    ])
    setUsers(u.users ?? [])
    setChurches(c.churches ?? [])
    setDistricts(d.districts ?? [])
    setProvinces(p.provinces ?? [])
  }

  useEffect(() => { load() }, [filterRole])

  const openCreate = () => {
    setForm(emptyForm)
    setError('')
    setShowPassword(false)
    setMode('create')
  }

  const openView = async (user: any) => {
    const res = await fetch(`/api/manage/users/${user._id}`)
    const data = await res.json()
    setSelected(data.user)
    setMode('view')
  }

  const openEdit = async (user: any) => {
    const res = await fetch(`/api/manage/users/${user._id}`)
    const data = await res.json()
    const u = data.user
    setSelected(u)
    setForm({
      name:       u.name       ?? '',
      email:      u.email      ?? '',
      password:   '••••••••',
      userRole:   u.role       ?? 'pastor',
      churchId:   u.church?._id   ?? '',
      districtId: u.district?._id ?? '',
      provinceId: u.province?._id ?? '',
    })
    setError('')
    setShowPassword(false)
    setMode('edit')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const res = await fetch('/api/manage/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error); return }
    setMode(null)
    setForm(emptyForm)
    load()
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const res = await fetch(`/api/manage/users/${selected._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error); return }
    setMode(null)
    load()
  }

  const handleSuspend = async (user: any) => {
    await fetch(`/api/manage/users/${user._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !user.isActive }),
    })
    load()
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    await fetch(`/api/manage/users/${confirmDelete._id}`, { method: 'DELETE' })
    setConfirmDelete(null)
    load()
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const churchRoles   = ['pastor', 'registrar', 'accountant']
  const districtRoles = ['district_admin']
  const provinceRoles = ['province_admin']

  const AssignmentField = ({ formData, onChange }: { formData: typeof emptyForm; onChange: (k: string, v: string) => void }) => {
    if (churchRoles.includes(formData.userRole)) return (
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">Assign Church</label>
        <select value={formData.churchId} onChange={e => onChange('churchId', e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm">
          <option value="">Select church...</option>
          {churches.map((c: any) => <option key={c._id} value={c._id}>{c.name} ({c.district?.name})</option>)}
        </select>
      </div>
    )
    if (districtRoles.includes(formData.userRole)) return (
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">Assign District</label>
        <select value={formData.districtId} onChange={e => onChange('districtId', e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm">
          <option value="">Select district...</option>
          {districts.map((d: any) => <option key={d._id} value={d._id}>{d.name} ({d.province?.name})</option>)}
        </select>
      </div>
    )
    if (provinceRoles.includes(formData.userRole)) return (
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">Assign Province</label>
        <select value={formData.provinceId} onChange={e => onChange('provinceId', e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm">
          <option value="">Select province...</option>
          {provinces.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>
    )
    return null
  }

  return (
    <DashboardLayout navItems={navItems} roleLabel="National Admin" roleColor="bg-red-600 text-white">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-foreground/60 mt-1">Create, view, edit, suspend or delete system users</p>
          </div>
          <Button onClick={openCreate} className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
            <UserPlus className="w-4 h-4 mr-2" /> Add User
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:border-[#1a3a2a] text-sm" />
          </div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:border-[#1a3a2a] text-sm">
            <option value="">All Roles</option>
            {roleOptions.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Users',    value: users.length },
            { label: 'Active',         value: users.filter(u => u.isActive).length,  color: 'text-green-600' },
            { label: 'Suspended',      value: users.filter(u => !u.isActive).length, color: 'text-red-600' },
            { label: 'Showing',        value: filtered.length },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-border px-4 py-3 shadow-sm">
              <p className={`text-xl font-bold ${color ?? 'text-foreground'}`}>{value}</p>
              <p className="text-xs text-foreground/60">{label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-[#f8faf8]">
                  {['Name', 'Email', 'Role', 'Assigned To', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 font-semibold text-foreground/70 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-foreground/50">No users found</td></tr>
                ) : filtered.map((u) => (
                  <tr key={u._id} className="border-b border-border/50 hover:bg-[#f8faf8] transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a3a2a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground/70">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${roleColors[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {u.role?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-foreground/70 whitespace-nowrap">
                      {u.church?.name ?? u.district?.name ?? u.province?.name ?? '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {/* View */}
                        <button onClick={() => openView(u)} title="View"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* Edit */}
                        <button onClick={() => openEdit(u)} title="Edit"
                          className="p-1.5 rounded-lg hover:bg-[#1a3a2a]/10 text-[#1a3a2a] transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* Suspend / Unsuspend */}
                        <button onClick={() => handleSuspend(u)}
                          title={u.isActive ? 'Suspend' : 'Activate'}
                          className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'hover:bg-orange-50 text-orange-500' : 'hover:bg-green-50 text-green-600'}`}>
                          {u.isActive ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                        {/* Delete */}
                        <button onClick={() => setConfirmDelete(u)} title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── VIEW MODAL ── */}
      {mode === 'view' && selected && (
        <Modal title="User Details" onClose={() => setMode(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="w-16 h-16 rounded-2xl bg-[#1a3a2a] flex items-center justify-center text-white text-2xl font-bold">
                {selected.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${roleColors[selected.role] ?? 'bg-gray-100'}`}>
                  {selected.role?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {[
              { label: 'Email',      value: selected.email },
              { label: 'Password',   value: selected.password ?? '••••••••' },
              { label: 'Role',       value: selected.role?.replace(/_/g, ' ') },
              { label: 'Church',     value: selected.church?.name },
              { label: 'District',   value: selected.district?.name },
              { label: 'Province',   value: selected.province?.name },
              { label: 'Status',     value: selected.isActive ? 'Active' : 'Suspended' },
              { label: 'Created',    value: selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
            ].filter(f => f.value).map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                <span className="text-sm font-semibold text-foreground/60">{label}</span>
                <span className={`text-sm font-medium ${label === 'Status' ? (selected.isActive ? 'text-green-600' : 'text-orange-500') : 'text-foreground'}`}>
                  {value}
                </span>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <Button onClick={() => openEdit(selected)} className="flex-1 bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
                <Pencil className="w-4 h-4 mr-2" /> Edit User
              </Button>
              <Button variant="outline" onClick={() => setMode(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── CREATE MODAL ── */}
      {mode === 'create' && (
        <Modal title="Create New User" onClose={() => setMode(null)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            {[
              { name: 'name',  label: 'Full Name', type: 'text'  },
              { name: 'email', label: 'Email',     type: 'email' },
            ].map(({ name, label, type }) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-foreground mb-1">{label}</label>
                <input type={type} value={(form as any)[name]}
                  onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required />
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70">
                  {showPassword ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Role</label>
              <select value={form.userRole} onChange={e => setForm(p => ({ ...p, userRole: e.target.value, churchId: '', districtId: '', provinceId: '' }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm">
                {roleOptions.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
            </div>

            <AssignmentField formData={form} onChange={(k, v) => setForm(p => ({ ...p, [k]: v }))} />

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
                {saving ? 'Creating...' : 'Create User'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setMode(null)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── EDIT MODAL ── */}
      {mode === 'edit' && selected && (
        <Modal title={`Edit — ${selected.name}`} onClose={() => setMode(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            {[
              { name: 'name',  label: 'Full Name', type: 'text'  },
              { name: 'email', label: 'Email',     type: 'email' },
            ].map(({ name, label, type }) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-foreground mb-1">{label}</label>
                <input type={type} value={(form as any)[name]}
                  onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required />
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                New Password <span className="text-foreground/40 font-normal">(leave as-is to keep current)</span>
              </label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70">
                  {showPassword ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Role</label>
              <select value={form.userRole} onChange={e => setForm(p => ({ ...p, userRole: e.target.value, churchId: '', districtId: '', provinceId: '' }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm">
                {roleOptions.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
            </div>

            <AssignmentField formData={form} onChange={(k, v) => setForm(p => ({ ...p, [k]: v }))} />

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setMode(null)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── DELETE CONFIRM ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground">Delete User?</h3>
              <p className="text-sm text-foreground/60 mt-1">
                This will permanently delete <span className="font-semibold text-foreground">{confirmDelete.name}</span>. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                Yes, Delete
              </Button>
              <Button variant="outline" onClick={() => setConfirmDelete(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
