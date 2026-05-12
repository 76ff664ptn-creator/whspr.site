import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';

import Post from '@/lib/models/Post';

export async function GET(request: NextRequest) {

  await connectDB();

  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q');

  if (!q) {

    return NextResponse.json([]);

  }

  try {

    const posts = await Post.find({ $text: { $search: q } }).sort({ score: { $meta: 'textScore' } }).limit(20);

    return NextResponse.json(posts);

  } catch (error) {

    console.error('Search API error', error);

    return NextResponse.json({ error: 'Search failed' }, { status: 500 });

  }

}