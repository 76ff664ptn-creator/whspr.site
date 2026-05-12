'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import PostItem from '../../../components/PostItem';

interface Post {

  _id: string;

  text: string;

  author: string;

  timestamp: string;

  replies: Post[];

  likes: { username: string; timestamp: Date }[];

  heat: number;

  proximityScore: number;

  locked: boolean;

}

export default function PostPage() {

  const params = useParams();

  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);

  const [username, setUsername] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const storedUsername = sessionStorage.getItem('username');

    if (!storedUsername) {

      router.push('/');

      return;

    }

    setUsername(storedUsername);

    fetchPost();

  }, [params.id]);

  const fetchPost = async () => {

    try {

      const res = await fetch(`/api/posts/${params.id}`);

      if (res.ok) {

        const data = await res.json();

        setPost(data);

      } else {

        router.push('/');

      }

    } catch (error) {

      console.error('Error fetching post:', error);

      router.push('/');

    } finally {

      setLoading(false);

    }

  };

  const handleUpdate = () => {

    fetchPost();

  };

  if (loading) {

    return <div className="min-h-screen bg-slate-900 text-slate-100 p-4">Loading...</div>;

  }

  if (!post) {

    return <div className="min-h-screen bg-slate-900 text-slate-100 p-4">Post not found</div>;

  }

  return (

    <div className="min-h-screen bg-slate-900 text-slate-100 p-4">

      <button onClick={() => router.push('/')} className="mb-4 bg-slate-700 text-slate-100 px-4 py-2 rounded hover:bg-slate-600">Back to Feed</button>

      <PostItem post={post} username={username} onUpdate={handleUpdate} onReplyClick={() => {}} />

    </div>

  );

}