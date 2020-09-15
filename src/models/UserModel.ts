import mongoose from 'mongoose';
import { Role } from '../graphql/typedefs';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: [Role.Admin, Role.TestUser, Role.User], required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
});

export default mongoose.model('User', UserSchema);
