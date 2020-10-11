import mongoose from 'mongoose';
import { Role, User } from '../graphql/types';

export interface IUserModel extends mongoose.Document {
  name: string;
  username: string;
  password: string;
  role: Role;
  items: Array<mongoose.Schema.Types.ObjectId>;
  itemLists: Array<mongoose.Schema.Types.ObjectId>;
  toJSON: () => User;
}

const UserSchema = new mongoose.Schema<User>({
  name: { type: String, required: true, minlength: 4 },
  username: { type: String, required: true, unique: true, minlength: 4 },
  password: { type: String, required: true, minlength: 8 },
  role: {
    type: String,
    enum: [Role.Admin, Role.TestUser, Role.User],
    required: true,
  },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  itemLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ItemList' }],
});

UserSchema.set('toJSON', { virtuals: true });

const UserModel = mongoose.model<IUserModel>('User', UserSchema);

export { UserModel };
