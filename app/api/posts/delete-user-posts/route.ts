import { NextRequest, NextResponse } from 'next/server';

import connectDB from '../../../../lib/mongodb';

import User from '../../../../lib/models/User';

import Post from '../../../../lib/models/Post';

export async function DELETE(request: NextRequest) {

  try {

    await connectDB();

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

    // Find all posts by the user

    const userPosts = await Post.find({ author: username });

    // Delete all posts and their replies recursively

    const deletePostAndReplies = async (postId: string) => {

      const post = await Post.findById(postId);

      if (post && post.replies.length > 0) {

        for (const replyId of post.replies) {

          await deletePostAndReplies(replyId.toString());

        }

      }

      await Post.findByIdAndDelete(postId);

    };

    for (const post of userPosts) {

      await deletePostAndReplies(post._id.toString());

    }

    return NextResponse.json({ success: true });

  } catch (error) {

    console.error('Error deleting user posts:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  }

}