'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import ChurchForm from '@/components/dashboard/ChurchForm'
import { navItems } from '../page'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProvinceChurchesPage() {
  const { data: session } = useSession()
  const user = session?.user as any
  const [churches, setChurches] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  const load = () => {
    if (!user?.provinceId) return
    fetch(`/api/manage/churches?province=${user.provinceId}`).then(r => r.json()).then(d => setChurches(d.churches ?? []))
  }
  useEffect(() => { load() }, [user?.provinceId])

  const filtered = churches.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.district?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'name',     label: 'Church Name' },
    { key: 'district', label: 'District', render: (r: any) => r.district?.name ?? r.districtName ?? '—' },
    { key: 'sector',   label: 'Sector',   render: (r: any) => r.sector  ?? '—' },
    { key: 'cell',     label: 'Cell',     render: (r: any) => r.cell    ?? '—' },
    { key: 'phone',    label: 'Phone',    render: (r: any) => r.phone   ?? '—' },
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
    <DashboardLayout navItems={navItems} roleLabel="Province Admin" roleColor="bg-purple-600 text-white">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Churches in {user?.provinceName}</h1>
            <p className="text-foreground/60 mt-1">{churches.length} churches</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Church
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search churches..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:border-[#1a3a2a] text-sm" />
        </div>

        <DataTable columns={columns} data={filtered} emptyMessage="No churches yet" />
      </div>

      {showModal && (
        <Modal title="Add New Church" onClose={() => setShowModal(false)}>
          <ChurchForm
            presetProvinceId={user?.provinceId}
            onSave={() => { setShowModal(false); load() }}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </DashboardLayout>
  )
}
