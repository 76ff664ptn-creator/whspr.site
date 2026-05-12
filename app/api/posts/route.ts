import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';

import Post from '@/lib/models/Post';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {

  const R = 6371; // km

  const dLat = (lat2 - lat1) * Math.PI / 180;

  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +

    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *

    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;

}

export async function GET(request: NextRequest) {

  try {

    await connectDB();

    const { searchParams } = new URL(request.url);

    const lon = parseFloat(searchParams.get('lon') || '0');

    const lat = parseFloat(searchParams.get('lat') || '0');

    let query = {};

    if (lon !== 0 || lat !== 0) {

      query = {

        location: {

          $near: {

            $geometry: { type: 'Point', coordinates: [lon, lat] },

            $maxDistance: 5000000 // 5000km

          }

        }

      };

    }

    const posts = await Post.find(query)
      .populate({
        path: 'replies',
        populate: {
          path: 'replies',
          populate: {
            path: 'replies',
          },
        },
      });

    // Calculate points for each post: replies = 2 points, likes = 1 point, only from last 4 hours

    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

    let maxPoints = 0;

    const postsWithPoints = posts.map(post => {

      // Count replies from last 4 hours
      const recentReplies = (post.replies || []).filter((reply: any) => reply.timestamp >= fourHoursAgo).length;

      // Count likes from last 4 hours
      const recentLikes = (post.likes || []).filter((like: any) => like.timestamp >= fourHoursAgo).length;

      const points = recentReplies * 2 + recentLikes * 1;

      if (points > maxPoints) {

        maxPoints = points;

      }

      return { ...post.toObject(), points };

    });

    // Ensure maxPoints is at least 1 to avoid division by zero

    if (maxPoints === 0) maxPoints = 1;

    const scoredPosts = postsWithPoints.map(post => {

      const postObj = { ...post };

      const coordinates = post.location?.coordinates;

      let proximityScore = 0;

      if (Array.isArray(coordinates) && coordinates.length === 2) {

        const [postLon, postLat] = coordinates;

        if (Number.isFinite(postLon) && Number.isFinite(postLat)) {

          const dist = getDistance(lat, lon, postLat, postLon);

          if (dist <= 5) {

            proximityScore = 100;

          } else if (dist < 5000) {

            const normalized = Math.log(dist / 5) / Math.log(1000);

            proximityScore = Math.max(0, 100 * (1 - normalized));

          }

        }

      }

      // Heat is now a percentage of the hottest post (0-100) based on recent interactions only

      const heat = (post.points / maxPoints) * 100;

      return { ...postObj, proximityScore, heat };

    });

    scoredPosts.sort((a, b) => (b.heat + b.proximityScore) - (a.heat + a.proximityScore));

    return NextResponse.json(scoredPosts.slice(0, 20));

  } catch (error) {

    console.error('Post feed API error', error);

    return NextResponse.json({ error: 'Unable to load posts' }, { status: 500 });

  }

}

export async function POST(request: NextRequest) {

  await connectDB();

  const { text, author, location } = await request.json();

  if (!text || !author) {

    return NextResponse.json({ error: 'Text and author required' }, { status: 400 });

  }

  const post = new Post({ text, author, location });

  await post.save();

  return NextResponse.json(post);

}