import { Schema, model, models } from 'mongoose'

const TransactionSchema = new Schema({
  type: {
    type: String,
    enum: ['tithe', 'offering', 'donation', 'expense'],
    required: true,
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'RWF' },
  description: String,
  church: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  category: String,
}, { timestamps: true })

export const Transaction = models.Transaction || model('Transaction', TransactionSchema)
