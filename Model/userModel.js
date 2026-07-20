import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
 {
  name: {
   type: String,
   trim: true,
   maxlength: [25, "User Name can not be longer than 25"],
   minlength: [3, "User name must be at least 3 characters long"],
   required: [true, "Please provide a user name"]
  },

  email: {
   type: String,
   unique: true,
   validate: [validator.isEmail, "Invalid Email Id"],
   lowercase: true,
   trim: true,
   required: [true, "Please provide a email Id"]
  },

  password: {
   type: String,
   minlength: [8, "Password must be at least 8 charater long"],
   required: true,
   select: false
  },

  passwordConfirm: {
   type: String,
   validate: {
    validator: function (el) {
     return el === this.password;
    },
    message: "Passwords do not match"
   }
  },

  role: {
   type: String,
   enum: ["customer", "staff", "admin"],
   default: "customer"
  },

  active: {
   type: Boolean,
   default: true
  },

  passwordChangedAt: {
   type: Date
  }
 },

 {
  timestamps: true
 }
);

userSchema.pre("save", async function () {
 if (!this.isModified("password")) return;

 this.password = await bcrypt.hash(this.password, 12);
 this.passwordConfirm = undefined;

 if (!this.isNew) {
  this.passwordChangedAt = Date.now() - 1000;
 }
});

userSchema.methods.checkCorrectPassword = async function (candidatePassword, userPassword) {
 return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.checkPasswordChanged = function (JWTTimesstamp) {
 if (this.passwordChangedAt) {
  const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

  return JWTTimesstamp < changedTimestamp;
 }
 return false;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
