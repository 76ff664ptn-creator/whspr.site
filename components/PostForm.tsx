import { useState, useEffect, useRef } from 'react';

interface ReplyTarget {

  postId: string;

  author: string;

}

interface Props {

  username: string;

  onPost: () => void;

  replyTarget: ReplyTarget | null;

  setReplyTarget: (target: ReplyTarget | null) => void;

}

export default function PostForm({ username, onPost, replyTarget, setReplyTarget }: Props) {

  const [text, setText] = useState('');

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {

    if (replyTarget) {

      inputRef.current?.focus();

    }

  }, [replyTarget]);

  const submitPost = async () => {

    if (!text.trim() || text.length > 1024) return;

    const location = await getLocation();

    const url = replyTarget ? `/api/posts/${replyTarget.postId}/reply` : '/api/posts';

    const body = replyTarget

      ? { text: text.trim(), author: username, location }

      : { text: text.trim(), author: username, location };

    const res = await fetch(url, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify(body),

    });

    if (res.ok) {

      setText('');

      if (replyTarget) {

        setReplyTarget(null);

      }

      onPost();

    }

  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    await submitPost();

  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {

    if (e.key === 'Enter' && !e.shiftKey) {

      e.preventDefault();

      await submitPost();

    }

  };

  const getLocation = (): Promise<{ type: string; coordinates: number[] }> => {

    return new Promise((resolve) => {

      if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(

          (position) => {

            resolve({

              type: 'Point',

              coordinates: [position.coords.longitude, position.coords.latitude],

            });

          },

          () => resolve({ type: 'Point', coordinates: [0, 0] })

        );

      } else {

        resolve({ type: 'Point', coordinates: [0, 0] });

      }

    });

  };

  return (

    <form onSubmit={handleSubmit} className="mb-4">

      <div className="relative rounded-3xl border border-slate-700 bg-slate-950/90">

        {replyTarget && (

          <div className="absolute left-4 top-3 flex items-center gap-2 text-sm text-slate-300">

            <span>Replying to</span>

            <strong className="text-white">{replyTarget.author}</strong>

            <button

              type="button"

              onClick={() => setReplyTarget(null)}

              className="text-slate-400 hover:text-slate-200"

            >

              ✕

            </button>

          </div>

        )}

        <textarea

          id="post-input"

          ref={inputRef}

          value={text}

          onChange={(e) => setText(e.target.value)}

          onKeyDown={handleKeyDown}

          maxLength={1024}

          placeholder={replyTarget ? `Reply to ${replyTarget.author}...` : "What's on your mind?"}

          className={`min-h-[40px] w-full resize-none rounded-3xl border-0 bg-transparent p-4 pr-14 text-slate-100 outline-none placeholder:text-slate-500 ${replyTarget ? 'pt-10' : ''}`}

          rows={1}

        />

        {text.trim().length > 0 && (

          <button

            type="submit"

            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-black/20"

            aria-label="Send post"

          >

            <span className="text-xl font-bold">↑</span>

          </button>

        )}

      </div>

    </form>

  );

}