const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI =
  'mongodb+srv://pacishimwe150_db_user:Ishimwe%4025517@cluster0.lhfbogk.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0'

const ProvinceSchema = new mongoose.Schema({ name: String, code: String }, { timestamps: true })
const DistrictSchema = new mongoose.Schema({ name: String, province: mongoose.Schema.Types.ObjectId }, { timestamps: true })
const ChurchSchema = new mongoose.Schema({
  name: String, district: mongoose.Schema.Types.ObjectId,
  province: mongoose.Schema.Types.ObjectId, address: String,
  phone: String, email: String, foundedYear: Number,
  isActive: { type: Boolean, default: true },
}, { timestamps: true })
const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: { type: String, enum: ['pastor','registrar','accountant','district_admin','province_admin','national_admin'] },
  church: mongoose.Schema.Types.ObjectId,
  district: mongoose.Schema.Types.ObjectId,
  province: mongoose.Schema.Types.ObjectId,
  isActive: { type: Boolean, default: true },
}, { timestamps: true })
const MemberSchema = new mongoose.Schema({
  firstName: String, lastName: String, email: String, phone: String,
  gender: String, church: mongoose.Schema.Types.ObjectId,
  joinDate: Date, isActive: { type: Boolean, default: true },
  ministry: String, baptized: Boolean,
}, { timestamps: true })
const TransactionSchema = new mongoose.Schema({
  type: String, amount: Number, currency: { type: String, default: 'RWF' },
  description: String, church: mongoose.Schema.Types.ObjectId,
  recordedBy: mongoose.Schema.Types.ObjectId, date: Date, category: String,
}, { timestamps: true })

const Province    = mongoose.model('Province',    ProvinceSchema)
const District    = mongoose.model('District',    DistrictSchema)
const Church      = mongoose.model('Church',      ChurchSchema)
const User        = mongoose.model('User',        UserSchema)
const Member      = mongoose.model('Member',      MemberSchema)
const Transaction = mongoose.model('Transaction', TransactionSchema)

async function seed() {
  console.log('Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to:', mongoose.connection.db.databaseName)

  console.log('Clearing existing data...')
  await Promise.all([
    Province.deleteMany({}),
    District.deleteMany({}),
    Church.deleteMany({}),
    User.deleteMany({}),
    Member.deleteMany({}),
    Transaction.deleteMany({}),
  ])

  const kigali = await Province.create({ name: 'Kigali City',       code: 'KIG' })
  const north  = await Province.create({ name: 'Northern Province', code: 'NOR' })
  const south  = await Province.create({ name: 'Southern Province', code: 'SOU' })
  const east   = await Province.create({ name: 'Eastern Province',  code: 'EAS' })
  const west   = await Province.create({ name: 'Western Province',  code: 'WES' })
  console.log('Provinces created')

  const gasabo   = await District.create({ name: 'Gasabo',   province: kigali._id })
  const kicukiro = await District.create({ name: 'Kicukiro', province: kigali._id })
  const musanze  = await District.create({ name: 'Musanze',  province: north._id  })
  console.log('Districts created')

  const church1 = await Church.create({
    name: 'AEBR Kacyiru', district: gasabo._id, province: kigali._id,
    address: 'Kacyiru, Kigali', phone: '+250 788 000 001',
    email: 'kacyiru@aebr.rw', foundedYear: 1990,
  })
  await Church.create({
    name: 'AEBR Kicukiro', district: kicukiro._id, province: kigali._id,
    address: 'Kicukiro, Kigali', phone: '+250 788 000 003',
    email: 'kicukiro@aebr.rw', foundedYear: 1998,
  })
  await Church.create({
    name: 'AEBR Musanze Central', district: musanze._id, province: north._id,
    address: 'Musanze Town', phone: '+250 788 000 002',
    email: 'musanze@aebr.rw', foundedYear: 1995,
  })
  console.log('Churches created')

  const hash = await bcrypt.hash('password123', 10)

  const accountant = await User.create({
    name: 'Alice Uwase', email: 'accountant@aebr.rw',
    password: hash, role: 'accountant', church: church1._id,
  })
  await User.create({ name: 'Pastor Jean',     email: 'pastor@aebr.rw',    password: hash, role: 'pastor',         church: church1._id })
  await User.create({ name: 'Registrar Marie', email: 'registrar@aebr.rw', password: hash, role: 'registrar',      church: church1._id })
  await User.create({ name: 'District Admin',  email: 'district@aebr.rw',  password: hash, role: 'district_admin', district: gasabo._id, province: kigali._id })
  await User.create({ name: 'Province Admin',  email: 'province@aebr.rw',  password: hash, role: 'province_admin', province: kigali._id })
  await User.create({ name: 'National Admin',  email: 'admin@aebr.rw',     password: hash, role: 'national_admin'  })
  console.log('Users created')

  const saved = await User.find({}, 'email role').lean()
  console.log('Saved users:')
  saved.forEach(u => console.log('  -', u.email, '(' + u.role + ')'))

  await Member.insertMany(
    [['John','Mugisha'],['Grace','Uwimana'],['Peter','Habimana'],
     ['Sarah','Mukamana'],['David','Niyonzima'],['Ruth','Ingabire'],
     ['Paul','Bizimana'],['Esther','Uwase'],['James','Ndayisaba'],['Mary','Umubyeyi']]
    .map(([firstName, lastName], i) => ({
      firstName, lastName,
      email: firstName.toLowerCase() + '@church.rw',
      phone: '+250 788 00' + i + ' 00' + i,
      gender: i % 2 === 0 ? 'male' : 'female',
      church: church1._id,
      joinDate: new Date(2023, i % 12, (i + 1) * 2),
      baptized: i % 3 === 0,
      ministry: ['Worship','Youth','Ushers','Prayer'][i % 4],
    }))
  )
  console.log('Members created')

  const txTypes = ['tithe','offering','donation','expense']
  await Transaction.insertMany(
    Array.from({ length: 12 }, (_, i) => ({
      type: txTypes[i % 4],
      amount: [50000, 30000, 75000, 20000][i % 4],
      church: church1._id,
      recordedBy: accountant._id,
      date: new Date(2024, i % 12, 15),
      description: txTypes[i % 4] + ' - Month ' + (i + 1),
      category: txTypes[i % 4],
    }))
  )
  console.log('Transactions created')

  console.log('\nSeed complete! Credentials (password: password123):')
  console.log('  pastor@aebr.rw')
  console.log('  registrar@aebr.rw')
  console.log('  accountant@aebr.rw')
  console.log('  district@aebr.rw')
  console.log('  province@aebr.rw')
  console.log('  admin@aebr.rw')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(e => {
  console.error('Seed failed:', e.message)
  process.exit(1)
})
