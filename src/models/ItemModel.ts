import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String },
  url: { type: String },
});

export default mongoose.model('Item', ItemSchema);
