import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Post from '@/lib/models/Post';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { username, lock } = await request.json();
  if (!username || typeof lock !== 'boolean') {
    return NextResponse.json({ error: 'Username and lock state required' }, { status: 400 });
  }

  const resolvedParams = await params;
  const post = await Post.findById(resolvedParams.id);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  if (post.author !== username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  post.locked = lock;
  post.lastInteraction = new Date();

  try {
    await post.save();
  } catch (error) {
    console.error('Lock route save error', error);
    return NextResponse.json({ error: 'Unable to save lock state' }, { status: 500 });
  }

  return NextResponse.json(post);
}
