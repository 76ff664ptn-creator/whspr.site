import { NextRequest, NextResponse } from 'next/server';

import connectDB from '../../../../../lib/mongodb';

import User from '../../../../../lib/models/User';

import Post from '../../../../../lib/models/Post';

export async function DELETE(

  request: NextRequest,

  { params }: { params: Promise<{ id: string }> }

) {

  try {

    await connectDB();

    const resolvedParams = await params;

    const { sessionId } = await request.json();

    if (!sessionId) {

      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });

    }

    // Find user by sessionId

    const user = await User.findOne({ sessionId });

    if (!user) {

      return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    }

    const username = user.username;

    const post = await Post.findById(resolvedParams.id);

    if (!post) {

      return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    }

    if (post.author !== username) {

      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    }

    // Delete all replies recursively

    const deleteReplies = async (postId: string) => {

      const post = await Post.findById(postId);

      if (post && post.replies.length > 0) {

        for (const replyId of post.replies) {

          await deleteReplies(replyId.toString());

        }

      }

      await Post.findByIdAndDelete(postId);

    };

    await deleteReplies(resolvedParams.id);

    return NextResponse.json({ success: true });

  } catch (error) {

    console.error('Error deleting post:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  }

}