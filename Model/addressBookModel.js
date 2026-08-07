import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    label: {
      type: String,
      enum: ['Home', 'Office', 'Other'],
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },

    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: {
      type: String,
    },

    city: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const AddressBook =
  mongoose.models.AddressBook ||
  mongoose.model('AddressBook', addressSchema);

export default AddressBook;
