import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';

import Post from '@/lib/models/Post';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  await connectDB();

  const { username } = await request.json();

  if (!username) {

    return NextResponse.json({ error: 'Username required' }, { status: 400 });

  }

  const resolvedParams = await params;

  const post = await Post.findById(resolvedParams.id);

  if (!post) {

    return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  }

  const likes = Array.isArray(post.likes) ? post.likes : [];

  const normalizedLikes = likes.map((like: any) => {

    if (typeof like === 'string') {

      return { username: like, timestamp: post.lastInteraction || post.timestamp || new Date() };

    }

    return like;

  });

  post.set('likes', normalizedLikes);

  post.set('likesCount', typeof post.likesCount === 'number' ? post.likesCount : normalizedLikes.length);

  const index = normalizedLikes.findIndex((like: any) => like.username === username);

  if (index > -1) {

    post.likes.splice(index, 1);

    post.likesCount = Math.max(0, post.likesCount - 1);

  } else {

    post.likes.push({ username, timestamp: new Date() });

    post.likesCount += 1;

  }

  post.markModified('likes');

  post.lastInteraction = new Date();

  try {

    await post.save();

  } catch (error: any) {

    console.error('Like route save error', error);

    return NextResponse.json({ error: 'Unable to save like' }, { status: 500 });

  }

  return NextResponse.json(post);

}