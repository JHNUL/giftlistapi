import mongoose from 'mongoose';
import { Item } from '../graphql/typedefs';

export interface IItemModel extends mongoose.Document {
  title: string
  reservedBy?: mongoose.Schema.Types.ObjectId
  description?: string
  url?: string
  toJSON: () => Item
}

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String },
  url: { type: String },
});

ItemSchema.set('toJSON', { virtuals: true });

const ItemModel = mongoose.model<IItemModel>('Item', ItemSchema);

export { ItemModel };
