'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import ChurchForm from '@/components/dashboard/ChurchForm'
import { navItems } from '../page'
import { Building2, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminChurchesPage() {
  const [churches, setChurches] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [provinces, setProvinces] = useState<any[]>([])
  const [filterProvince, setFilterProvince] = useState('')

  const load = async () => {
    const url = filterProvince ? `/api/manage/churches?province=${filterProvince}` : '/api/manage/churches'
    const [c, p] = await Promise.all([
      fetch(url).then(r => r.json()),
      fetch('/api/manage/provinces').then(r => r.json()),
    ])
    setChurches(c.churches ?? [])
    setProvinces(p.provinces ?? [])
  }
  useEffect(() => { load() }, [filterProvince])

  const filtered = churches.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.district?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'name',     label: 'Church Name' },
    { key: 'province', label: 'Province',  render: (r: any) => r.province?.name  ?? r.provinceName ?? '—' },
    { key: 'district', label: 'District',  render: (r: any) => r.district?.name  ?? r.districtName ?? '—' },
    { key: 'sector',   label: 'Sector',    render: (r: any) => r.sector   ?? '—' },
    { key: 'cell',     label: 'Cell',      render: (r: any) => r.cell     ?? '—' },
    { key: 'phone',    label: 'Phone',     render: (r: any) => r.phone    ?? '—' },
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
    <DashboardLayout navItems={navItems} roleLabel="National Admin" roleColor="bg-red-600 text-white">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Church Management</h1>
            <p className="text-foreground/60 mt-1">{churches.length} churches nationwide</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Church
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search churches..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:border-[#1a3a2a] text-sm" />
          </div>
          <select value={filterProvince} onChange={e => setFilterProvince(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:border-[#1a3a2a] text-sm">
            <option value="">All Provinces</option>
            {provinces.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>

        <DataTable columns={columns} data={filtered} emptyMessage="No churches yet" />
      </div>

      {showModal && (
        <Modal title="Add New Church" onClose={() => setShowModal(false)}>
          <ChurchForm onSave={() => { setShowModal(false); load() }} onCancel={() => setShowModal(false)} />
        </Modal>
      )}
    </DashboardLayout>
  )
}
