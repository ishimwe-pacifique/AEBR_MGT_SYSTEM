import { Schema, model, models } from 'mongoose'

export type UserRole = 'pastor' | 'registrar' | 'accountant' | 'district_admin' | 'province_admin' | 'national_admin'

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['pastor', 'registrar', 'accountant', 'district_admin', 'province_admin', 'national_admin'],
    required: true,
  },
  // Church-level roles
  church: { type: Schema.Types.ObjectId, ref: 'Church' },
  // District admin
  district: { type: Schema.Types.ObjectId, ref: 'District' },
  // Province admin
  province: { type: Schema.Types.ObjectId, ref: 'Province' },
  isActive: { type: Boolean, default: true },
  // Password reset
  resetPasswordToken: { type: String }, // hashed token for URL identification
  verificationCode: { type: String },   // hashed verification code
  resetPasswordExpires: { type: Date },
}, { timestamps: true })

export const User = models.User || model('User', UserSchema)
