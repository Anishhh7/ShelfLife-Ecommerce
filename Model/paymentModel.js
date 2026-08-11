import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ['Credit-card', 'Debit-card', 'Wallet', 'COD'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const Payment =
  mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;
