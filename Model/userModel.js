import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const isVendor = function () {
  return this.role === 'vendor';
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [25, 'User Name can not be longer than 25'],
      minlength: [
        3,
        'User name must have at least 3 characters long',
      ],
      required: [true, 'Please provide a user name'],
    },

    email: {
      type: String,
      unique: true,
      validate: [validator.isEmail, 'Invalid Email Id'],
      lowercase: true,
      trim: true,
      required: [true, 'Please provide a email Id'],
    },

    phone: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'Please provide your mobile number'],
    },

    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 charater long'],
      required: true,
      select: false,
    },

    passwordConfirm: {
      type: String,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match',
      },
    },

    role: {
      type: String,
      enum: ['customer', 'staff', 'vendor', 'admin'],
      default: 'customer',
    },

    active: {
      type: Boolean,
      default: true,
    },

    passwordChangedAt: {
      type: Date,
    },

    approved: {
      type: Boolean,
      default: false,
    },

    storeName: {
      type: String,
      required: [
        isVendor,
        'Store name is required for vendor accounts.',
      ],
    },

    location: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: [
        isVendor,
        'Location type is required for vendor accounts',
      ],
    },

    coordinates: {
      type: [Number],
      required: [
        isVendor,
        'Coordinates is required for vendor accounts.',
      ],
    },

    address: {
      type: String,
      required: [
        isVendor,
        'Address is required for vendor accounts.',
      ],
    },
    
    description: String,

    passwordChangedAt: Date,
    passwordResetOTP: String,
    passwordResetOTPExpires: Date,
    refreshTokenExpires: Date,
    refreshTokenHash: {
      type: String,
      select: false,
    },
    refreshTokenFamily: String,
  },

  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.methods.checkCorrectPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.checkPasswordChanged = function (JWTTimesstamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimesstamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.passwordResetOTP = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  console.log({ otp }, 'Hashed:', this.passwordResetOTP);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return otp;
};

const User =
  mongoose.models.User || mongoose.model('User', userSchema);

export default User;
