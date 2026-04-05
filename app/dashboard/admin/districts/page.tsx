'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import { navItems } from '../page'
import { MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getRwandaDistricts } from '@/lib/rwanda-data'

export default function AdminDistrictsPage() {
  const [districts, setDistricts] = useState<any[]>([])
  const [provinces, setProvinces] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', provinceId: '' })
  const [saving, setSaving] = useState(false)
  const [filterProvince, setFilterProvince] = useState('')

  const load = async () => {
    const url = filterProvince ? `/api/manage/districts?province=${filterProvince}` : '/api/manage/districts'
    const [d, p] = await Promise.all([
      fetch(url).then(r => r.json()),
      fetch('/api/manage/provinces').then(r => r.json()),
    ])
    setDistricts(d.districts ?? [])
    setProvinces(p.provinces ?? [])
  }
  useEffect(() => { load() }, [filterProvince])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/manage/districts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setShowModal(false)
    setForm({ name: '', provinceId: '' })
    load()
  }

  const quickAddDistrict = async (name: string, provinceId: string) => {
    await fetch('/api/manage/districts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, provinceId }),
    })
    load()
  }

  const columns = [
    { key: 'name', label: 'District Name' },
    { key: 'province', label: 'Province', render: (r: any) => r.province?.name ?? '—' },
    { key: 'createdAt', label: 'Created', render: (r: any) => new Date(r.createdAt).toLocaleDateString() },
  ]

  return (
    <DashboardLayout navItems={navItems} roleLabel="National Admin" roleColor="bg-red-600 text-white">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">District Management</h1>
            <p className="text-foreground/60 mt-1">Manage all districts across Rwanda</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add District
          </Button>
        </div>

        <div className="flex gap-3">
          <select value={filterProvince} onChange={e => setFilterProvince(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:border-[#1a3a2a] text-sm">
            <option value="">All Provinces</option>
            {provinces.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>

        {/* Quick add Rwanda districts per province */}
        {provinces.map((prov: any) => {
          const rwDistricts = getRwandaDistricts(prov.name)
          if (!rwDistricts.length) return null
          return (
            <div key={prov._id} className="bg-[#f8faf8] rounded-2xl p-4 border border-border">
              <p className="text-sm font-semibold text-foreground mb-3">{prov.name} — Quick Add Districts</p>
              <div className="flex flex-wrap gap-2">
                {rwDistricts.map((d: string) => {
                  const exists = districts.some(di => di.name === d && di.province?._id === prov._id)
                  return (
                    <button key={d} disabled={exists}
                      onClick={() => quickAddDistrict(d, prov._id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border
                        ${exists ? 'bg-green-50 text-green-700 border-green-200 cursor-default' : 'bg-white border-border hover:border-[#1a3a2a] hover:bg-[#1a3a2a] hover:text-white'}`}>
                      {exists ? '✓ ' : '+ '}{d}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        <DataTable columns={columns} data={districts} emptyMessage="No districts yet. Add provinces first." />
      </div>

      {showModal && (
        <Modal title="Add District" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Province</label>
              <select value={form.provinceId} onChange={e => setForm(p => ({ ...p, provinceId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required>
                <option value="">Select province...</option>
                {provinces.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">District Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
                {saving ? 'Saving...' : 'Save District'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
