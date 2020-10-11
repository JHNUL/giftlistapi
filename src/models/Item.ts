import mongoose from 'mongoose';
import { Item } from '../graphql/types';

export interface IItemModel extends mongoose.Document {
  title: string;
  reserved: boolean;
  description?: string;
  url?: string;
  toJSON: () => Item;
}

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  reserved: { type: Boolean, default: false },
  description: { type: String },
  url: { type: String },
});

ItemSchema.set('toJSON', { virtuals: true });

const ItemModel = mongoose.model<IItemModel>('Item', ItemSchema);

export { ItemModel };
