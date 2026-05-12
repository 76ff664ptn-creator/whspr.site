import { NextRequest, NextResponse } from 'next/server';

import connectDB from '../../../../lib/mongodb';

import Post from '../../../../lib/models/Post';

export async function GET(

  request: NextRequest,

  { params }: { params: Promise<{ id: string }> }

) {

  try {

    await connectDB();

    const resolvedParams = await params;

    const post = await Post.findById(resolvedParams.id).populate('replies');

    if (!post) {

      return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    }

    return NextResponse.json(post);

  } catch (error) {

    console.error('Error fetching post:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  }

}