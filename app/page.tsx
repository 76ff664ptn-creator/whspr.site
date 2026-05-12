'use client';

import { useState, useEffect, useRef } from 'react';

import Image from 'next/image';

import UsernameForm from '@/components/UsernameForm';

import PostForm from '@/components/PostForm';

import PostList from '@/components/PostList';

import Search from '@/components/Search';

export default function Home() {

  const [username, setUsername] = useState('');

  const [sessionId, setSessionId] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);

  const [usernameError, setUsernameError] = useState('');

  const [showSearch, setShowSearch] = useState(false);

  const [replyTarget, setReplyTarget] = useState<{ postId: string; author: string } | null>(null);

  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  const cleanupInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {

    const storedUsername = sessionStorage.getItem('username');

    const storedSessionId = sessionStorage.getItem('sessionId');

    if (storedUsername && storedSessionId) {

      // Verify session is still valid

      verifySession(storedUsername, storedSessionId);

    }

    // Start cleanup interval

    cleanupInterval.current = setInterval(async () => {

      try {

        await fetch('/api/auth/cleanup', {

          method: 'POST',

        });

      } catch (error) {

        console.error('Cleanup failed:', error);

      }

    }, 2 * 60 * 1000); // Clean up every 2 minutes

  }, []);

  const verifySession = async (u: string, sId: string) => {

    try {

      const res = await fetch('/api/auth/heartbeat', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ sessionId: sId }),

      });

      if (res.ok) {

        setUsername(u);

        setSessionId(sId);

        startHeartbeat(sId);

      } else {

        // Session invalid, clear storage

        sessionStorage.removeItem('username');

        sessionStorage.removeItem('sessionId');

      }

    } catch (error) {

      console.error('Session verification failed:', error);

      sessionStorage.removeItem('username');

      sessionStorage.removeItem('sessionId');

    }

  };

  const startHeartbeat = (sId: string) => {

    if (heartbeatInterval.current) {

      clearInterval(heartbeatInterval.current);

    }

    heartbeatInterval.current = setInterval(async () => {

      try {

        await fetch('/api/auth/heartbeat', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ sessionId: sId }),

        });

      } catch (error) {

        console.error('Heartbeat failed:', error);

      }

    }, 60000); // Ping every minute

  };

  const handleSetUsername = async (u: string) => {

    try {

      setUsernameError('');

      const res = await fetch('/api/auth/username', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ username: u }),

      });

      if (res.ok) {

        const data = await res.json();

        sessionStorage.setItem('username', data.username);

        sessionStorage.setItem('sessionId', data.sessionId);

        setUsername(data.username);

        setSessionId(data.sessionId);

        startHeartbeat(data.sessionId);

      } else {

        const error = await res.json();

        setUsernameError(error.error);

      }

    } catch (error) {

      console.error('Failed to set username:', error);

      setUsernameError('Failed to set username');

    }

  };

  const handleLogout = () => {

    if (heartbeatInterval.current) {

      clearInterval(heartbeatInterval.current);

    }

    sessionStorage.removeItem('username');

    sessionStorage.removeItem('sessionId');

    setUsername('');

    setSessionId('');

    setReplyTarget(null);

  };

  const refreshFeed = () => {

    setRefreshKey((prev) => prev + 1);

  };

  const handleReplyClick = (postId: string, author: string) => {

    setReplyTarget({ postId, author });

    setShowSearch(false);

    setTimeout(() => {

      document.getElementById('post-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    }, 150);

  };

  // Cleanup on unmount

  useEffect(() => {

    return () => {

      if (heartbeatInterval.current) {

        clearInterval(heartbeatInterval.current);

      }

      if (cleanupInterval.current) {

        clearInterval(cleanupInterval.current);

      }

    };

  }, []);

  if (!username) {

    return <UsernameForm onSet={handleSetUsername} error={usernameError} />;

  }

  return (

    <div className="min-h-screen bg-slate-900 text-slate-100">

      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-5">

        <header className="mb-4 rounded-3xl bg-slate-800/80 p-4 shadow-lg shadow-black/20 backdrop-blur">

          <div className="flex items-center justify-between">

            <button

              onClick={() => {

                if (confirm('Are you sure you want to end your session? Your posts will be deleted.')) {

                  handleLogout();

                  window.location.reload();

                }

              }}

              aria-label="End session"

              className="inline-flex items-center justify-center rounded-full p-2 transition hover:bg-slate-700"

            >

              ✕

            </button>

            <button

              onClick={refreshFeed}

              aria-label="Refresh feed"

              className="inline-flex items-center justify-center rounded-full p-2 transition hover:bg-slate-700"

            >

              <Image src="/logo.png" alt="Whspr logo" width={40} height={40} className="rounded-full" />

            </button>

            <button

              onClick={() => setShowSearch((prev) => !prev)}

              aria-label="Toggle search"

              className="inline-flex items-center justify-center rounded-full p-2 transition hover:bg-slate-700"

            >

              🔍

            </button>

          </div>

        </header>

        {showSearch && (

          <div className="mb-4 rounded-3xl bg-slate-800/90 p-4 shadow-inner shadow-black/10">

            <Search />

          </div>

        )}

        <main className="flex-1 space-y-4">

          <section className="space-y-4">

            <PostList username={username} refreshKey={refreshKey} onReplyClick={handleReplyClick} />

          </section>

        </main>

        <footer className="mt-4 rounded-3xl bg-slate-800/90 p-4 shadow-lg shadow-black/20 backdrop-blur">

          <PostForm username={username} onPost={refreshFeed} replyTarget={replyTarget} setReplyTarget={setReplyTarget} />

        </footer>

      </div>

    </div>

  );

}
