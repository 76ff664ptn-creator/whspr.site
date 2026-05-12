import { NextRequest, NextResponse } from 'next/server';

import connectDB from '../../../../lib/mongodb';

import User from '../../../../lib/models/User';

export async function POST(request: NextRequest) {

  try {

    await connectDB();

    const { sessionId } = await request.json();

    if (!sessionId) {

      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });

    }

    const user = await User.findOneAndUpdate(

      { sessionId },

      { lastActivity: new Date() },

      { new: true }

    );

    if (!user) {

      return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    }

    return NextResponse.json({ success: true, username: user.username });

  } catch (error) {

    console.error('Error updating heartbeat:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  }

}