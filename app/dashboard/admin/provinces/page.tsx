'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import { navItems } from '../page'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getRwandaProvinces } from '@/lib/rwanda-data'

const provinceCodes: Record<string, string> = {
  'Kigali City': 'KIG', 'Northern Province': 'NOR',
  'Southern Province': 'SOU', 'Eastern Province': 'EAS', 'Western Province': 'WES',
}

type Mode = 'create' | 'edit' | 'view' | null

export default function AdminProvincesPage() {
  const [provinces, setProvinces]   = useState<any[]>([])
  const [mode, setMode]             = useState<Mode>(null)
  const [selected, setSelected]     = useState<any>(null)
  const [form, setForm]             = useState({ name: '', code: '' })
  const [saving, setSaving]         = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<any>(null)
  const rwandaProvinces = getRwandaProvinces()

  const load = () => fetch('/api/manage/provinces').then(r => r.json()).then(d => setProvinces(d.provinces ?? []))
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm({ name: '', code: '' }); setMode('create') }
  const openView   = (row: any) => { setSelected(row); setMode('view') }
  const openEdit   = (row: any) => { setSelected(row); setForm({ name: row.name, code: row.code }); setMode('edit') }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    if (mode === 'create') {
      await fetch('/api/manage/provinces', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch(`/api/manage/provinces/${selected._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setSaving(false); setMode(null); load()
  }

  const handleDelete = async () => {
    await fetch(`/api/manage/provinces/${confirmDelete._id}`, { method: 'DELETE' })
    setConfirmDelete(null); load()
  }

  const quickAdd = async (name: string) => {
    await fetch('/api/manage/provinces', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, code: provinceCodes[name] ?? name.slice(0,3).toUpperCase() }) })
    load()
  }

  const columns = [
    { key: 'name', label: 'Province Name' },
    { key: 'code', label: 'Code', render: (r: any) => <span className="px-2 py-1 bg-[#1a3a2a]/10 text-[#1a3a2a] rounded-lg text-xs font-bold">{r.code}</span> },
    { key: 'createdAt', label: 'Created', render: (r: any) => new Date(r.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) },
    {
      key: 'actions', label: 'Actions', searchable: false,
      render: (r: any) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openView(r)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-[#1a3a2a]/10 text-[#1a3a2a] transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setConfirmDelete(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ]

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-2.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-foreground/60 font-medium">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )

  return (
    <DashboardLayout navItems={navItems} roleLabel="National Admin" roleColor="bg-red-600 text-white">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Province Management</h1>
            <p className="text-foreground/60 mt-1">{provinces.length} provinces in system</p>
          </div>
          <Button onClick={openCreate} className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Province
          </Button>
        </div>

        {/* Quick add */}
        <div className="bg-[#f8faf8] rounded-2xl p-4 border border-border">
          <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-3">Rwanda Official Provinces — Quick Add</p>
          <div className="flex flex-wrap gap-2">
            {rwandaProvinces.map(p => {
              const exists = provinces.some(pr => pr.name === p)
              return (
                <button key={p} disabled={exists} onClick={() => quickAdd(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${exists ? 'bg-green-50 text-green-700 border-green-200 cursor-default' : 'bg-white border-border hover:border-[#1a3a2a] hover:bg-[#1a3a2a] hover:text-white'}`}>
                  {exists ? '✓ ' : '+ '}{p}
                </button>
              )
            })}
          </div>
        </div>

        <DataTable columns={columns} data={provinces} emptyMessage="No provinces yet" searchPlaceholder="Search provinces..." />
      </div>

      {/* View */}
      {mode === 'view' && selected && (
        <Modal title="Province Details" onClose={() => setMode(null)}>
          <div className="space-y-1">
            <Field label="Name"    value={selected.name} />
            <Field label="Code"    value={selected.code} />
            <Field label="Created" value={new Date(selected.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })} />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => openEdit(selected)} className="flex-1 bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white"><Pencil className="w-4 h-4 mr-2" />Edit</Button>
            <Button variant="outline" onClick={() => setMode(null)}>Close</Button>
          </div>
        </Modal>
      )}

      {/* Create / Edit */}
      {(mode === 'create' || mode === 'edit') && (
        <Modal title={mode === 'create' ? 'Add Province' : `Edit — ${selected?.name}`} onClose={() => setMode(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Province Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Code (e.g. KIG)</label>
              <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} maxLength={5}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">{saving ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}</Button>
              <Button type="button" variant="outline" onClick={() => setMode(null)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto"><Trash2 className="w-6 h-6 text-red-500" /></div>
            <div className="text-center">
              <h3 className="text-lg font-bold">Delete Province?</h3>
              <p className="text-sm text-foreground/60 mt-1">Permanently delete <span className="font-semibold text-foreground">{confirmDelete.name}</span>. This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Delete</Button>
              <Button variant="outline" onClick={() => setConfirmDelete(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
