import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';

import Post from '@/lib/models/Post';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  await connectDB();

  const resolvedParams = await params;

  const { text, author, location } = await request.json();

  if (!text || !author) {

    return NextResponse.json({ error: 'Text and author required' }, { status: 400 });

  }

  const reply = new Post({ text, author, location });

  await reply.save();

  await Post.findByIdAndUpdate(resolvedParams.id, {

    $push: { replies: reply._id },

    $inc: { repliesCount: 1 },

    $set: { lastInteraction: new Date() }

  });

  return NextResponse.json(reply);

}