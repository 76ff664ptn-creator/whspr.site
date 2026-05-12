import { NextRequest, NextResponse } from 'next/server';

import connectDB from '../../../../lib/mongodb';
import User from '../../../../lib/models/User';
import Post from '../../../../lib/models/Post';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { username, sessionId } = await request.json();
    if (!username || !sessionId) {
      return NextResponse.json({ error: 'Username and session ID required' }, { status: 400 });
    }

    const user = await User.findOne({ sessionId, username });
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const lockedPosts = await Post.find({ author: username, locked: true });
    if (lockedPosts.length > 0) {
      await User.findOneAndUpdate(
        { username: 'whspr' },
        { username: 'whspr', sessionId: 'whspr', lastActivity: new Date(), locked: true },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      await Post.updateMany(
        { author: username, locked: true },
        { $set: { author: 'whspr', locked: true, lastInteraction: new Date() } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error on logout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
