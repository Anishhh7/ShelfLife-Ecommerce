import crypto from 'crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Default_Images from '../Config/defaultImages.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },

    phone: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },

    password: {
      type: String,
      select: false,
      required: true,
    },

    passwordConfirm: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ['customer', 'staff', 'vendor', 'admin'],
      default: 'customer',
      required: true,
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
    },

    profileImage: {
      type: {
        url: String,
        publicId: String,
      },
      default: Default_Images.user,
    },

    vendorImage: {
      type: {
        url: String,
        publicId: String,
      },
      default: Default_Images.vendor,
    },

    staffImage: {
      type: {
        url: String,
        publicId: String,
      },
      default: Default_Images.staff,
    },
    location: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },

    coordinates: {
      type: [Number],
    },

    address: {
      type: String,
    },

    description: String,

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

  this.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000;

  console.log({ otp }, 'Hashed:', this.passwordResetOTP);

  return otp;
};

const User =
  mongoose.models.User || mongoose.model('User', userSchema);

export default User;
