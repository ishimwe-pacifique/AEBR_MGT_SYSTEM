'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getRwandaSectors, getRwandaCells } from '@/lib/rwanda-data'

interface ChurchFormProps {
  onSave: () => void
  onCancel: () => void
  presetProvinceId?: string
  presetDistrictId?: string
  initialData?: any
  editId?: string
}

export default function ChurchForm({ onSave, onCancel, presetProvinceId, presetDistrictId, initialData, editId }: ChurchFormProps) {
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const [form, setForm] = useState({
    name:         initialData?.name         ?? '',
    provinceId:   initialData?.province?._id ?? presetProvinceId ?? '',
    districtId:   initialData?.district?._id ?? presetDistrictId ?? '',
    provinceName: initialData?.province?.name ?? initialData?.provinceName ?? '',
    districtName: initialData?.district?.name ?? initialData?.districtName ?? '',
    sector:       initialData?.sector       ?? '',
    cell:         initialData?.cell         ?? '',
    village:      initialData?.village      ?? '',
    address:      initialData?.address      ?? '',
    phone:        initialData?.phone        ?? '',
    email:        initialData?.email        ?? '',
    foundedYear:  initialData?.foundedYear  ? String(initialData.foundedYear) : '',
    isActive:     initialData?.isActive     ?? true,
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
    })
  }, [])

  const filteredDistricts = form.provinceId
    ? districts.filter((d: any) => d.province?._id === form.provinceId)
    : districts

  const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true)
    const url    = editId ? `/api/manage/churches/${editId}` : '/api/manage/churches'
    const method = editId ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error); return }
    onSave()
  }

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-[#1a3a2a] focus:ring-2 focus:ring-[#1a3a2a]/10 text-sm transition-all"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">Church Name *</label>
        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. AEBR Kacyiru" className={inputCls} required />
      </div>

      {!presetProvinceId && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Province *</label>
          <select value={form.provinceId} onChange={e => {
            const prov = provinces.find(p => p._id === e.target.value)
            set('provinceId', e.target.value); set('provinceName', prov?.name ?? '')
            set('districtId', ''); set('districtName', ''); set('sector', ''); set('cell', '')
          }} className={inputCls} required>
            <option value="">Select province...</option>
            {provinces.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {!presetDistrictId && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">District *</label>
          <select value={form.districtId} onChange={e => {
            const dist = filteredDistricts.find((d: any) => d._id === e.target.value)
            set('districtId', e.target.value); set('districtName', dist?.name ?? '')
            set('sector', ''); set('cell', '')
          }} className={inputCls} required>
            <option value="">Select district...</option>
            {filteredDistricts.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
      )}

      {sectors.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Sector</label>
          <select value={form.sector} onChange={e => { set('sector', e.target.value); set('cell', '') }} className={inputCls}>
            <option value="">Select sector...</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {cells.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Cell</label>
          <select value={form.cell} onChange={e => set('cell', e.target.value)} className={inputCls}>
            <option value="">Select cell...</option>
            {cells.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">Village</label>
        <input value={form.village} onChange={e => set('village', e.target.value)} placeholder="Village name" className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Phone</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+250 788 000 000" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Founded Year</label>
          <input type="number" value={form.foundedYear} onChange={e => set('foundedYear', e.target.value)}
            placeholder="e.g. 1995" min="1900" max={new Date().getFullYear()} className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">Email</label>
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="church@aebr.rw" className={inputCls} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">Address</label>
        <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Physical address" className={inputCls} />
      </div>

      {editId && (
        <div className="flex items-center gap-3">
          <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 accent-[#1a3a2a]" />
          <label htmlFor="isActive" className="text-sm font-medium text-foreground">Active Church</label>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving} className="flex-1 bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white">
          {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Church'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
