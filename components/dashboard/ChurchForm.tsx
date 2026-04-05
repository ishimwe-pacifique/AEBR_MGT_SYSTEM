'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getRwandaDistricts, getRwandaSectors, getRwandaCells } from '@/lib/rwanda-data'

interface ChurchFormProps {
  onSave: () => void
  onCancel: () => void
  presetProvinceId?: string
  presetDistrictId?: string
}

export default function ChurchForm({ onSave, onCancel, presetProvinceId, presetDistrictId }: ChurchFormProps) {
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', provinceId: presetProvinceId ?? '', districtId: presetDistrictId ?? '',
    provinceName: '', districtName: '', sector: '', cell: '', village: '',
    address: '', phone: '', email: '', foundedYear: '',
  })

  const sectors = getRwandaSectors(form.districtName)
  const cells   = getRwandaCells(form.sector)

  useEffect(() => {
    Promise.all([
      fetch('/api/manage/provinces').then(r => r.json()),
      fetch('/api/manage/districts').then(r => r.json()),
    ]).then(([p, d]) => {
      setProvinces(p.provinces ?? [])
      setDistricts(d.districts ?? [])
      // Pre-fill names if IDs are preset
      if (presetProvinceId) {
        const prov = p.provinces?.find((x: any) => x._id === presetProvinceId)
        if (prov) setForm(f => ({ ...f, provinceName: prov.name }))
      }
      if (presetDistrictId) {
        const dist = d.districts?.find((x: any) => x._id === presetDistrictId)
        if (dist) setForm(f => ({ ...f, districtName: dist.name }))
      }
    })
  }, [])

  const filteredDistricts = form.provinceId
    ? districts.filter((d: any) => d.province?._id === form.provinceId)
    : districts

  const set = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const res = await fetch('/api/manage/churches', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error); return }
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">Church Name *</label>
        <input value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="e.g. AEBR Kacyiru"
          className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required />
      </div>

      {!presetProvinceId && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Province *</label>
          <select value={form.provinceId}
            onChange={e => {
              const prov = provinces.find(p => p._id === e.target.value)
              set('provinceId', e.target.value)
              set('provinceName', prov?.name ?? '')
              set('districtId', '')
              set('districtName', '')
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required>
            <option value="">Select province...</option>
            {provinces.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {!presetDistrictId && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">District *</label>
          <select value={form.districtId}
            onChange={e => {
              const dist = filteredDistricts.find((d: any) => d._id === e.target.value)
              set('districtId', e.target.value)
              set('districtName', dist?.name ?? '')
              set('sector', '')
              set('cell', '')
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" required>
            <option value="">Select district...</option>
            {filteredDistricts.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
      )}

      {sectors.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Sector</label>
          <select value={form.sector} onChange={e => { set('sector', e.target.value); set('cell', '') }}
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm">
            <option value="">Select sector...</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {cells.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Cell</label>
          <select value={form.cell} onChange={e => set('cell', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm">
            <option value="">Select cell...</option>
            {cells.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">Village</label>
        <input value={form.village} onChange={e => set('village', e.target.value)}
          placeholder="Village name"
          className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Phone</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="+250 788 000 000"
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Founded Year</label>
          <input type="number" value={form.foundedYear} onChange={e => set('foundedYear', e.target.value)}
            placeholder="e.g. 1995" min="1900" max={new Date().getFullYear()}
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">Email</label>
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
          placeholder="church@aebr.rw"
          className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] text-sm" />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving} className="flex-1 bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
          {saving ? 'Saving...' : 'Save Church'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
