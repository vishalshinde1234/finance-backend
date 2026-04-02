import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['income', 'expense'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes — heavy load ke liye fast queries
recordSchema.index({ type: 1 });
recordSchema.index({ category: 1 });
recordSchema.index({ date: -1 });
recordSchema.index({ createdBy: 1 });
recordSchema.index({ isDeleted: 1 });

const Record = mongoose.model('Record', recordSchema);
export default Record;