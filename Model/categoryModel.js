import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
  },
  coverImage: {
    type: [String],
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
    timestamps:true
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category;
