import mongoose, { Schema, model, models } from 'mongoose'

const ProvinceSchema = new Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
}, { timestamps: true })

export const Province = models.Province || model('Province', ProvinceSchema)
