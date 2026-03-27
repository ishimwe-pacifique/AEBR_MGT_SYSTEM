import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Province } from '@/lib/models/Province'
import { District } from '@/lib/models/District'
import { Church } from '@/lib/models/Church'
import { User } from '@/lib/models/User'
import { Member } from '@/lib/models/Member'
import { Transaction } from '@/lib/models/Transaction'
import bcrypt from 'bcryptjs'

export async function GET() {
  await connectDB()

  // Clear existing
  await Promise.all([
    Province.deleteMany({}),
    District.deleteMany({}),
    Church.deleteMany({}),
    User.deleteMany({}),
    Member.deleteMany({}),
    Transaction.deleteMany({}),
  ])

  // Provinces
  const kigali = await Province.create({ name: 'Kigali City', code: 'KIG' })
  const north = await Province.create({ name: 'Northern Province', code: 'NOR' })

  // Districts
  const gasabo = await District.create({ name: 'Gasabo', province: kigali._id })
  const musanze = await District.create({ name: 'Musanze', province: north._id })

  // Churches
  const church1 = await Church.create({
    name: 'AEBR Kacyiru',
    district: gasabo._id,
    province: kigali._id,
    address: 'Kacyiru, Kigali',
    phone: '+250 788 000 001',
    email: 'kacyiru@aebr.rw',
    foundedYear: 1990,
  })
  const church2 = await Church.create({
    name: 'AEBR Musanze Central',
    district: musanze._id,
    province: north._id,
    address: 'Musanze Town',
    phone: '+250 788 000 002',
    email: 'musanze@aebr.rw',
    foundedYear: 1995,
  })

  const hash = await bcrypt.hash('password123', 10)

  // Users — one per role
  const accountant = await User.create({
    name: 'Alice Uwase',
    email: 'accountant@aebr.rw',
    password: hash,
    role: 'accountant',
    church: church1._id,
  })

  await User.insertMany([
    { name: 'Pastor Jean', email: 'pastor@aebr.rw', password: hash, role: 'pastor', church: church1._id },
    { name: 'Registrar Marie', email: 'registrar@aebr.rw', password: hash, role: 'registrar', church: church1._id },
    { name: 'District Admin', email: 'district@aebr.rw', password: hash, role: 'district_admin', district: gasabo._id, province: kigali._id },
    { name: 'Province Admin', email: 'province@aebr.rw', password: hash, role: 'province_admin', province: kigali._id },
    { name: 'National Admin', email: 'admin@aebr.rw', password: hash, role: 'national_admin' },
  ])

  // Members
  const memberNames = [
    ['John', 'Mugisha'], ['Grace', 'Uwimana'], ['Peter', 'Habimana'],
    ['Sarah', 'Mukamana'], ['David', 'Niyonzima'], ['Ruth', 'Ingabire'],
    ['Paul', 'Bizimana'], ['Esther', 'Uwase'], ['James', 'Ndayisaba'], ['Mary', 'Umubyeyi'],
  ]
  const members = await Member.insertMany(
    memberNames.map(([firstName, lastName], i) => ({
      firstName, lastName,
      email: `${firstName.toLowerCase()}@church.rw`,
      phone: `+250 78${i} 000 00${i}`,
      gender: i % 2 === 0 ? 'male' : 'female',
      church: church1._id,
      joinDate: new Date(2023, i % 12, (i + 1) * 2),
      baptized: i % 3 === 0,
      ministry: ['Worship', 'Youth', 'Ushers', 'Prayer'][i % 4],
    }))
  )

  // Transactions
  const txTypes: Array<'tithe' | 'offering' | 'donation' | 'expense'> = ['tithe', 'offering', 'donation', 'expense']
  await Transaction.insertMany(
    Array.from({ length: 12 }, (_, i) => ({
      type: txTypes[i % 4],
      amount: [50000, 30000, 75000, 20000][i % 4],
      church: church1._id,
      recordedBy: accountant._id,
      date: new Date(2024, i % 12, 15),
      description: `${txTypes[i % 4]} - Month ${i + 1}`,
      category: txTypes[i % 4],
    }))
  )

  return NextResponse.json({
    message: 'Database seeded successfully',
    credentials: {
      pastor: 'pastor@aebr.rw',
      registrar: 'registrar@aebr.rw',
      accountant: 'accountant@aebr.rw',
      district_admin: 'district@aebr.rw',
      province_admin: 'province@aebr.rw',
      national_admin: 'admin@aebr.rw',
      password: 'password123',
    },
  })
}
