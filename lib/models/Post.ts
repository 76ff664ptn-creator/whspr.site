import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  text: { type: String, required: true, maxlength: 1024 },
  author: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  likes: {
    type: [{
      username: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }],
    default: []
  },
  repliesCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  heat: { type: Number, default: 0 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  lastInteraction: { type: Date, default: Date.now }
});

PostSchema.index({ location: '2dsphere' });
PostSchema.index({ text: 'text' });

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

export default Post;