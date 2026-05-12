import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  lastActivity: { type: Date, default: Date.now },
  sessionId: { type: String, required: true, unique: true }
});

UserSchema.index({ lastActivity: 1 });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ sessionId: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);