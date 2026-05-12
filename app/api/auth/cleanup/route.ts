import { NextRequest, NextResponse } from 'next/server';

import connectDB from '../../../../lib/mongodb';

import User from '../../../../lib/models/User';

import Post from '../../../../lib/models/Post';

export async function POST(request: NextRequest) {

  try {

    await connectDB();

    // Remove users inactive for more than 5 minutes

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const inactiveUsers = await User.find({ lastActivity: { $lt: fiveMinutesAgo }, locked: false });

    const inactiveUsernames = inactiveUsers.map(user => user.username);

    let postsToDelete: any[] = [];

    // Delete all posts by inactive users

    if (inactiveUsernames.length > 0) {
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

      // Find all posts by inactive users

      postsToDelete = await Post.find({
        author: { $in: inactiveUsernames },
        $or: [
          { locked: { $exists: false } },
          { locked: false },
          { lastInteraction: { $lt: fortyEightHoursAgo } }
        ]
      });

      // Delete posts and their replies recursively

      const deletePostAndReplies = async (postId: string) => {

        const post = await Post.findById(postId);

        if (post && post.replies.length > 0) {

          for (const replyId of post.replies) {

            await deletePostAndReplies(replyId.toString());

          }

        }

        await Post.findByIdAndDelete(postId);

      };

      for (const post of postsToDelete) {

        await deletePostAndReplies(post._id.toString());

      }

      // Remove inactive users

      await User.deleteMany({ lastActivity: { $lt: fiveMinutesAgo } });

    }

    return NextResponse.json({

      success: true,

      cleanedUsers: inactiveUsernames.length,

      cleanedPosts: inactiveUsernames.length > 0 ? postsToDelete.length : 0

    });

  } catch (error) {

    console.error('Error cleaning up sessions:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  }

}