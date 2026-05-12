import { useState, useEffect, useCallback } from 'react';

import PostItem from './PostItem';

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

interface Props {

  username: string;

  refreshKey: number;

  onReplyClick: (postId: string, author: string) => void;

  searchQuery?: string;

}

export default function PostList({ username, refreshKey, onReplyClick, searchQuery = '' }: Props) {

  const [posts, setPosts] = useState<Post[]>([]);

  const [location, setLocation] = useState<{ lon: number; lat: number } | null>(null);

  const getLocation = () => {

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(

        (position) => {

          setLocation({

            lon: position.coords.longitude,

            lat: position.coords.latitude,

          });

        },

        () => setLocation({ lon: 0, lat: 0 })

      );

    } else {

      setLocation({ lon: 0, lat: 0 });

    }

  };

  const fetchPosts = useCallback(async () => {

    if (!location) return;

    try {

      const res = await fetch(`/api/posts?lon=${location.lon}&lat=${location.lat}`);

      if (!res.ok) {

        console.error('Failed to load posts', res.status);

        setPosts([]);

        return;

      }

      const text = await res.text();

      if (!text) {

        setPosts([]);

        return;

      }

      const data = JSON.parse(text);

      setPosts(data);

    } catch (error) {

      console.error('Error fetching posts', error);

      setPosts([]);

    }

  }, [location]);

  useEffect(() => {

    getLocation();

  }, []);

  useEffect(() => {

    if (location) {

      fetchPosts();

    }

  }, [location, refreshKey, fetchPosts]);

  const filteredPosts = posts.filter(post =>

    searchQuery === '' || post.text.toLowerCase().includes(searchQuery.toLowerCase()) || post.author.toLowerCase().includes(searchQuery.toLowerCase())

  );

  return (

    <div>

      {filteredPosts.map((post) => (

        <PostItem key={post._id} post={post} username={username} onUpdate={fetchPosts} onReplyClick={onReplyClick} />

      ))}

    </div>

  );

}