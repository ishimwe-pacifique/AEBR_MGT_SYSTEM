import { Schema, model, models } from 'mongoose'

const MemberSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: String,
  phone: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female'] },
  address: String,
  church: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
  joinDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  ministry: String,
  baptized: { type: Boolean, default: false },
}, { timestamps: true })

export const Member = models.Member || model('Member', MemberSchema)
