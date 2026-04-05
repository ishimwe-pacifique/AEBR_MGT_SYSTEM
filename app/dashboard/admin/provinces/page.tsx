'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import { navItems } from '../page'
import { Globe, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getRwandaProvinces } from '@/lib/rwanda-data'

export default function AdminProvincesPage() {
  const [provinces, setProvinces] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', code: '' })
  const [saving, setSaving] = useState(false)

  const rwandaProvinces = getRwandaProvinces()
  const provinceCodes: Record<string, string> = {
    'Kigali City': 'KIG', 'Northern Province': 'NOR',
    'Southern Province': 'SOU', 'Eastern Province': 'EAS', 'Western Province': 'WES',
  }

  const load = () => fetch('/api/manage/provinces').then(r => r.json()).then(d => setProvinces(d.provinces ?? []))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/manage/provinces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setShowModal(false)
    setForm({ name: '', code: '' })
    load()
  }

  const columns = [
    { key: 'name', label: 'Province Name' },
    { key: 'code', label: 'Code' },
    { key: 'createdAt', label: 'Created', render: (r: any) => new Date(r.createdAt).toLocaleDateString() },
  ]

  return (
    <DashboardLayout navItems={navItems} roleLabel="National Admin" roleColor="bg-red-600 text-white">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Province Management</h1>
            <p className="text-foreground/60 mt-1">Manage all provinces in Rwanda</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Province
          </Button>
        </div>

        {/* Rwanda provinces quick-add */}
        <div className="bg-[#f8faf8] rounded-2xl p-4 border border-border">
          <p className="text-sm font-semibold text-foreground/60 mb-3">Rwanda Official Provinces — Quick Add</p>
          <div className="flex flex-wrap gap-2">
            {rwandaProvinces.map(p => {
              const exists = provinces.some(pr => pr.name === p)
              return (
                <button key={p} disabled={exists}
                  onClick={async () => {
                    await fetch('/api/manage/provinces', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: p, code: provinceCodes[p] ?? p.slice(0,3).toUpperCase() }),
                    })
                    load()
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border
                    ${exists ? 'bg-green-50 text-green-700 border-green-200 cursor-default' : 'bg-white border-border hover:border-[#1a3a2a] hover:bg-[#1a3a2a] hover:text-white'}`}>
                  {exists ? '✓ ' : '+ '}{p}
                </button>
              )
            })}
          </div>
        </div>

        <DataTable columns={columns} data={provinces} emptyMessage="No provinces yet" />
      </div>

      {showModal && (
        <Modal title="Add Province" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Province Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Code (e.g. KIG)</label>
              <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                maxLength={5}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
                {saving ? 'Saving...' : 'Save Province'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
