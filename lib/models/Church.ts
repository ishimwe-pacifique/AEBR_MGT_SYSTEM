import { Schema, model, models } from 'mongoose'

const ChurchSchema = new Schema({
  name: { type: String, required: true },
  district: { type: Schema.Types.ObjectId, ref: 'District', required: true },
  province: { type: Schema.Types.ObjectId, ref: 'Province', required: true },
  // Rwanda admin hierarchy
  provinceName: String,
  districtName: String,
  sector: String,
  cell: String,
  village: String,
  address: String,
  phone: String,
  email: String,
  foundedYear: Number,
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export const Church = models.Church || model('Church', ChurchSchema)
