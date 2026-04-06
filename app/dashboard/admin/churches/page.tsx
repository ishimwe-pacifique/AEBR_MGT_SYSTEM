'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import ChurchForm from '@/components/dashboard/ChurchForm'
import { navItems } from '../page'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Mode = 'create' | 'edit' | 'view' | null

export default function AdminChurchesPage() {
  const [churches, setChurches]   = useState<any[]>([])
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [mode, setMode]           = useState<Mode>(null)
  const [selected, setSelected]   = useState<any>(null)
  const [filterProvince, setFilterProvince] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')
  const [filterStatus, setFilterStatus]     = useState('')
  const [confirmDelete, setConfirmDelete]   = useState<any>(null)

  const load = async () => {
    let url = '/api/manage/churches'
    if (filterDistrict) url += `?district=${filterDistrict}`
    else if (filterProvince) url += `?province=${filterProvince}`
    const [c, p, d] = await Promise.all([
      fetch(url).then(r => r.json()),
      fetch('/api/manage/provinces').then(r => r.json()),
      fetch('/api/manage/districts').then(r => r.json()),
    ])
    setChurches(c.churches ?? [])
    setProvinces(p.provinces ?? [])
    setDistricts(d.districts ?? [])
  }
  useEffect(() => { load() }, [filterProvince, filterDistrict])

  const openView = async (row: any) => {
    const res = await fetch(`/api/manage/churches/${row._id}`)
    const data = await res.json()
    setSelected(data.church); setMode('view')
  }
  const openEdit = async (row: any) => {
    const res = await fetch(`/api/manage/churches/${row._id}`)
    const data = await res.json()
    setSelected(data.church); setMode('edit')
  }

  const handleDelete = async () => {
    await fetch(`/api/manage/churches/${confirmDelete._id}`, { method: 'DELETE' })
    setConfirmDelete(null); load()
  }

  const filteredDistricts = filterProvince ? districts.filter((d: any) => d.province?._id === filterProvince) : districts

  const displayData = churches.filter(c => {
    if (filterStatus === 'active')   return c.isActive
    if (filterStatus === 'inactive') return !c.isActive
    return true
  })

  const columns = [
    { key: 'name',     label: 'Church Name' },
    { key: 'province', label: 'Province', render: (r: any) => <span className="text-xs font-medium text-foreground/70">{r.province?.name ?? r.provinceName ?? '—'}</span> },
    { key: 'district', label: 'District', render: (r: any) => <span className="text-xs font-medium text-foreground/70">{r.district?.name ?? r.districtName ?? '—'}</span> },
    { key: 'sector',   label: 'Sector',   render: (r: any) => r.sector ?? '—' },
    { key: 'cell',     label: 'Cell',     render: (r: any) => r.cell   ?? '—' },
    { key: 'phone',    label: 'Phone',    render: (r: any) => r.phone  ?? '—' },
    { key: 'foundedYear', label: 'Founded', render: (r: any) => r.foundedYear ?? '—' },
    {
      key: 'isActive', label: 'Status', searchable: false,
      render: (r: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
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

  const Filters = (
    <>
      <select value={filterProvince} onChange={e => { setFilterProvince(e.target.value); setFilterDistrict('') }}
        className="px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:border-[#1a3a2a] text-sm">
        <option value="">All Provinces</option>
        {provinces.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
      </select>
      <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}
        className="px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:border-[#1a3a2a] text-sm">
        <option value="">All Districts</option>
        {filteredDistricts.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
      </select>
      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
        className="px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:border-[#1a3a2a] text-sm">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </>
  )

  const ViewField = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <div className="flex justify-between py-2.5 border-b border-border/50 last:border-0">
        <span className="text-sm text-foreground/60 font-medium">{label}</span>
        <span className="text-sm font-semibold text-foreground text-right max-w-[60%]">{value}</span>
      </div>
    ) : null

  return (
    <DashboardLayout navItems={navItems} roleLabel="National Admin" roleColor="bg-red-600 text-white">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Church Management</h1>
            <p className="text-foreground/60 mt-1">{churches.length} churches nationwide</p>
          </div>
          <Button onClick={() => setMode('create')} className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Church
          </Button>
        </div>

        <DataTable
          columns={columns} data={displayData}
          emptyMessage="No churches found" searchPlaceholder="Search by name, district, sector..."
          extraFilters={Filters}
        />
      </div>

      {/* View */}
      {mode === 'view' && selected && (
        <Modal title="Church Details" onClose={() => setMode(null)}>
          <div className="space-y-1">
            <ViewField label="Name"         value={selected.name} />
            <ViewField label="Province"     value={selected.province?.name ?? selected.provinceName} />
            <ViewField label="District"     value={selected.district?.name ?? selected.districtName} />
            <ViewField label="Sector"       value={selected.sector} />
            <ViewField label="Cell"         value={selected.cell} />
            <ViewField label="Village"      value={selected.village} />
            <ViewField label="Address"      value={selected.address} />
            <ViewField label="Phone"        value={selected.phone} />
            <ViewField label="Email"        value={selected.email} />
            <ViewField label="Founded"      value={selected.foundedYear ? String(selected.foundedYear) : undefined} />
            <ViewField label="Status"       value={selected.isActive ? 'Active' : 'Inactive'} />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => openEdit(selected)} className="flex-1 bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white"><Pencil className="w-4 h-4 mr-2" />Edit</Button>
            <Button variant="outline" onClick={() => setMode(null)}>Close</Button>
          </div>
        </Modal>
      )}

      {/* Create */}
      {mode === 'create' && (
        <Modal title="Add New Church" onClose={() => setMode(null)}>
          <ChurchForm onSave={() => { setMode(null); load() }} onCancel={() => setMode(null)} />
        </Modal>
      )}

      {/* Edit */}
      {mode === 'edit' && selected && (
        <Modal title={`Edit — ${selected.name}`} onClose={() => setMode(null)}>
          <ChurchForm
            editId={selected._id}
            initialData={selected}
            onSave={() => { setMode(null); load() }}
            onCancel={() => setMode(null)}
          />
        </Modal>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto"><Trash2 className="w-6 h-6 text-red-500" /></div>
            <div className="text-center">
              <h3 className="text-lg font-bold">Delete Church?</h3>
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
