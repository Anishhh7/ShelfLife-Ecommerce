import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },

        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          min: [1, 'Quantity must have at least 1'],
          required: [true, 'Quantity can not be empty'],
        },
        itemStatus: {
          type: String,
          enum: [
            'Pending',
            'Confirmed',
            'Packed',
            'Shipped',
            'Delivered',
            'Cancelled',
          ],
          default: 'Pending',
        },

        statusHistory: [
          {
            status: {
              type: String,
              enum: [
                'Pending',
                'Confirmed',
                'Packed',
                'Shipped',
                'Out for Delivery',
                'Delivered',
                'Cancelled',
              ],
            },
            updatedBy: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            },
            updatedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],

    shippingAddress: {
      type: String,
      required: [true, 'Address is required'],
    },
    totalAmount: {
      type: Number,
      min: 0,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const Order =
  mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
