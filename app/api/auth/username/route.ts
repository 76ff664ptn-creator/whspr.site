import { NextRequest, NextResponse } from 'next/server';

import connectDB from '../../../../lib/mongodb';

import User from '../../../../lib/models/User';

export async function POST(request: NextRequest) {

  try {

    await connectDB();

    const { username } = await request.json();

    if (!username || !username.trim()) {

      return NextResponse.json({ error: 'Username required' }, { status: 400 });

    }

    const trimmedUsername = username.trim();

    // Check if username is already taken

    const existingUser = await User.findOne({ username: trimmedUsername });

    if (existingUser) {

      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });

    }

    // Generate a unique session ID

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create new user

    const user = new User({

      username: trimmedUsername,

      sessionId,

      lastActivity: new Date()

    });

    await user.save();

    return NextResponse.json({ username: trimmedUsername, sessionId });

  } catch (error) {

    console.error('Error setting username:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  }

}