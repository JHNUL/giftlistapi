import mongoose from 'mongoose';
import { ItemList } from '../graphql/types';

export interface IItemListModel extends mongoose.Document {
  name: string;
  identifier: string;
  owner: mongoose.Schema.Types.ObjectId;
  created: Date;
  items: Array<mongoose.Schema.Types.ObjectId>;
  toJSON: () => ItemList;
}

const ItemListSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 4 },
  identifier: { type: Boolean, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created: { type: Date, required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
});

ItemListSchema.set('toJSON', { virtuals: true });

const ItemListModel = mongoose.model<IItemListModel>('ItemList', ItemListSchema);

export { ItemListModel };
