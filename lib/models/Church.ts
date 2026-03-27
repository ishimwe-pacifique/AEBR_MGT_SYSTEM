import { Schema, model, models } from 'mongoose'

const ChurchSchema = new Schema({
  name: { type: String, required: true },
  district: { type: Schema.Types.ObjectId, ref: 'District', required: true },
  province: { type: Schema.Types.ObjectId, ref: 'Province', required: true },
  address: String,
  phone: String,
  email: String,
  foundedYear: Number,
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export const Church = models.Church || model('Church', ChurchSchema)
