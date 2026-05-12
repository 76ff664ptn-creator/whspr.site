'use client';

import { useState, MouseEvent } from 'react';

import Link from 'next/link';

interface Post {

  _id: string;

  text: string;

  author: string;

  timestamp: string;

  replies: Post[];

  likes: { username: string; timestamp: Date }[];

  heat: number;

  proximityScore: number;

}

interface Props {

  post: Post;

  username: string;

  onUpdate: () => void;

  onReplyClick: (postId: string, author: string) => void;

}

export default function PostItem({ post, username, onUpdate, onReplyClick }: Props) {

  const [showChildren, setShowChildren] = useState(true);

  const liked = (post.likes || []).some((like) => like.username === username);

  const handleLike = async (e: MouseEvent<HTMLButtonElement>) => {

    e.preventDefault();

    e.stopPropagation();

    try {

      const res = await fetch(`/api/posts/${post._id}/like`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ username }),

      });

      if (res.ok) {

        onUpdate();

      } else {

        const errorText = await res.text();

        console.error('Like request failed', res.status, errorText);

      }

    } catch (error) {

      console.error('Like request error', error);

    }

  };

  return (

    <div className="border p-4 mb-4 bg-slate-800 rounded-lg hover:bg-slate-750 transition">

      <div className="flex items-start justify-between gap-3">

        <Link href={`/posts/${post._id}`} className="flex-1">

          <p className="text-slate-100">

            <span className="text-slate-200/90 font-semibold block">{post.author}</span>

            <span className="block text-slate-100 whitespace-pre-wrap">{post.text}</span>

          </p>

        </Link>

        <div className="flex gap-2">

          <button

            type="button"

            onClick={(e) => {

              e.preventDefault();

              e.stopPropagation();

              onReplyClick(post._id, post.author);

            }}

            className="text-blue-400 hover:text-blue-300 text-lg"

            aria-label={`Reply to ${post.author}`}

          >

            ↩️

          </button>

          <button

            type="button"

            onClick={(e) => {

              e.preventDefault();

              e.stopPropagation();

              handleLike(e);

            }}

            className={liked ? 'text-blue-200 hover:text-blue-100 text-lg' : 'text-red-400 hover:text-red-300 text-lg'}

            aria-label={liked ? 'Unlike post' : 'Like post'}

          >

            {liked ? '❄️' : '🔥'}

          </button>

        </div>

      </div>

      <div className="mt-3 flex gap-2">

        <div className="flex-1 bg-slate-600 rounded-full h-2">

          <div

            className="bg-gradient-to-r from-yellow-400 to-red-500 h-2 rounded-full"

            style={{ width: `${Math.min(post.heat, 100)}%` }}

          ></div>

        </div>

        <div className="flex-1 bg-slate-600 rounded-full h-2">

          <div

            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"

            style={{ width: `${post.proximityScore}%` }}

          ></div>

        </div>

      </div>

      <div className="ml-4 mt-3 space-y-2">

        {(post.replies || []).map((reply) => (

          <PostItem key={reply._id} post={reply} username={username} onUpdate={onUpdate} onReplyClick={onReplyClick} />

        ))}

      </div>

    </div>

  );

}