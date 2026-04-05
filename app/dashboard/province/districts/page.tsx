'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import { navItems } from '../page'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getRwandaDistricts } from '@/lib/rwanda-data'

export default function ProvinceDistrictsPage() {
  const { data: session } = useSession()
  const user = session?.user as any
  const [districts, setDistricts] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '' })
  const [saving, setSaving] = useState(false)

  const rwDistricts = getRwandaDistricts(user?.provinceName ?? '')

  const load = () => {
    if (!user?.provinceId) return
    fetch(`/api/manage/districts?province=${user.provinceId}`).then(r => r.json()).then(d => setDistricts(d.districts ?? []))
  }
  useEffect(() => { load() }, [user?.provinceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/manage/districts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, provinceId: user.provinceId }),
    })
    setSaving(false)
    setShowModal(false)
    setForm({ name: '' })
    load()
  }

  const quickAdd = async (name: string) => {
    await fetch('/api/manage/districts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, provinceId: user.provinceId }),
    })
    load()
  }

  const columns = [
    { key: 'name',      label: 'District Name' },
    { key: 'createdAt', label: 'Created', render: (r: any) => new Date(r.createdAt).toLocaleDateString() },
  ]

  return (
    <DashboardLayout navItems={navItems} roleLabel="Province Admin" roleColor="bg-purple-600 text-white">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Districts in {user?.provinceName}</h1>
            <p className="text-foreground/60 mt-1">{districts.length} districts managed</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add District
          </Button>
        </div>

        {rwDistricts.length > 0 && (
          <div className="bg-[#f8faf8] rounded-2xl p-4 border border-border">
            <p className="text-sm font-semibold text-foreground/60 mb-3">Official Districts in {user?.provinceName} — Quick Add</p>
            <div className="flex flex-wrap gap-2">
              {rwDistricts.map((d: string) => {
                const exists = districts.some(di => di.name === d)
                return (
                  <button key={d} disabled={exists} onClick={() => quickAdd(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border
                      ${exists ? 'bg-green-50 text-green-700 border-green-200 cursor-default' : 'bg-white border-border hover:border-[#1a3a2a] hover:bg-[#1a3a2a] hover:text-white'}`}>
                    {exists ? '✓ ' : '+ '}{d}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <DataTable columns={columns} data={districts} emptyMessage="No districts yet" />
      </div>

      {showModal && (
        <Modal title="Add District" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">District Name</label>
              <input value={form.name} onChange={e => setForm({ name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
