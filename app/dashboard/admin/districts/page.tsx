'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import { navItems } from '../page'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getRwandaDistricts } from '@/lib/rwanda-data'

type Mode = 'create' | 'edit' | 'view' | null

export default function AdminDistrictsPage() {
  const [districts, setDistricts]   = useState<any[]>([])
  const [provinces, setProvinces]   = useState<any[]>([])
  const [mode, setMode]             = useState<Mode>(null)
  const [selected, setSelected]     = useState<any>(null)
  const [form, setForm]             = useState({ name: '', provinceId: '' })
  const [saving, setSaving]         = useState(false)
  const [filterProvince, setFilterProvince] = useState('')
  const [confirmDelete, setConfirmDelete]   = useState<any>(null)

  const load = async () => {
    const url = filterProvince ? `/api/manage/districts?province=${filterProvince}` : '/api/manage/districts'
    const [d, p] = await Promise.all([fetch(url).then(r => r.json()), fetch('/api/manage/provinces').then(r => r.json())])
    setDistricts(d.districts ?? [])
    setProvinces(p.provinces ?? [])
  }
  useEffect(() => { load() }, [filterProvince])

  const openCreate = () => { setForm({ name: '', provinceId: filterProvince }); setMode('create') }
  const openView   = (row: any) => { setSelected(row); setMode('view') }
  const openEdit   = (row: any) => { setSelected(row); setForm({ name: row.name, provinceId: row.province?._id ?? '' }); setMode('edit') }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    if (mode === 'create') {
      await fetch('/api/manage/districts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch(`/api/manage/districts/${selected._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setSaving(false); setMode(null); load()
  }

  const handleDelete = async () => {
    await fetch(`/api/manage/districts/${confirmDelete._id}`, { method: 'DELETE' })
    setConfirmDelete(null); load()
  }

  const quickAdd = async (name: string, provinceId: string) => {
    await fetch('/api/manage/districts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, provinceId }) })
    load()
  }

  const columns = [
    { key: 'name', label: 'District Name' },
    { key: 'province', label: 'Province', render: (r: any) => (
      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold">{r.province?.name ?? '—'}</span>
    )},
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

  const ProvinceFilter = (
    <select value={filterProvince} onChange={e => setFilterProvince(e.target.value)}
      className="px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:border-[#1a3a2a] text-sm min-w-[160px]">
      <option value="">All Provinces</option>
      {provinces.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
    </select>
  )

  const AddBtn = (
    <Button onClick={openCreate} className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white whitespace-nowrap">
      <Plus className="w-4 h-4 mr-2" /> Add District
    </Button>
  )

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
            <h1 className="text-2xl font-bold text-foreground">District Management</h1>
            <p className="text-foreground/60 mt-1">{districts.length} districts across Rwanda</p>
          </div>
          <Button onClick={openCreate} className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add District
          </Button>
        </div>

        {/* Quick add per province */}
        {provinces.map((prov: any) => {
          const rwDistricts = getRwandaDistricts(prov.name)
          if (!rwDistricts.length) return null
          const missing = rwDistricts.filter(d => !districts.some(di => di.name === d && di.province?._id === prov._id))
          if (!missing.length) return (
            <div key={prov._id} className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-semibold">
              ✓ All {rwDistricts.length} districts added for {prov.name}
            </div>
          )
          return (
            <div key={prov._id} className="bg-[#f8faf8] rounded-2xl p-4 border border-border">
              <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-3">{prov.name} — Quick Add Missing Districts</p>
              <div className="flex flex-wrap gap-2">
                {rwDistricts.map((d: string) => {
                  const exists = districts.some(di => di.name === d && di.province?._id === prov._id)
                  return (
                    <button key={d} disabled={exists} onClick={() => quickAdd(d, prov._id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${exists ? 'bg-green-50 text-green-700 border-green-200 cursor-default' : 'bg-white border-border hover:border-[#1a3a2a] hover:bg-[#1a3a2a] hover:text-white'}`}>
                      {exists ? '✓ ' : '+ '}{d}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        <DataTable
          columns={columns} data={districts}
          emptyMessage="No districts yet" searchPlaceholder="Search districts..."
          extraFilters={ProvinceFilter}
        />
      </div>

      {mode === 'view' && selected && (
        <Modal title="District Details" onClose={() => setMode(null)}>
          <div className="space-y-1">
            <Field label="Name"     value={selected.name} />
            <Field label="Province" value={selected.province?.name ?? '—'} />
            <Field label="Created"  value={new Date(selected.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })} />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => openEdit(selected)} className="flex-1 bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white"><Pencil className="w-4 h-4 mr-2" />Edit</Button>
            <Button variant="outline" onClick={() => setMode(null)}>Close</Button>
          </div>
        </Modal>
      )}

      {(mode === 'create' || mode === 'edit') && (
        <Modal title={mode === 'create' ? 'Add District' : `Edit — ${selected?.name}`} onClose={() => setMode(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Province *</label>
              <select value={form.provinceId} onChange={e => setForm(p => ({ ...p, provinceId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required>
                <option value="">Select province...</option>
                {provinces.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">District Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">{saving ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}</Button>
              <Button type="button" variant="outline" onClick={() => setMode(null)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto"><Trash2 className="w-6 h-6 text-red-500" /></div>
            <div className="text-center">
              <h3 className="text-lg font-bold">Delete District?</h3>
              <p className="text-sm text-foreground/60 mt-1">Permanently delete <span className="font-semibold text-foreground">{confirmDelete.name}</span>.</p>
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
