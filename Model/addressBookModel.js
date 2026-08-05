import mongoose from 'mongoose';
import validator from 'validator';

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
      maxlength: [25, 'Full name can not be long the 25 characters'],
    },
    mobileNumber: {
      type: String,
      validate: [
        {
          validator: function (v) {
            return '/^[\+]?[0-9]{0,3}\W?+[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im';
          },
          message: (props) =>
            `${props.value} is not a valid mobile number`,
        },
      ],
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
