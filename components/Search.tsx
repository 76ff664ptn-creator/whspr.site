import { useState } from 'react';

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

export default function Search() {

  const [query, setQuery] = useState('');

  const [results, setResults] = useState<Post[]>([]);

  const handleSearch = async () => {

    if (!query.trim()) return;

    try {

      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);

      if (!res.ok) {

        console.error('Search request failed', res.status);

        setResults([]);

        return;

      }

      const text = await res.text();

      if (!text) {

        setResults([]);

        return;

      }

      const data = JSON.parse(text);

      setResults(data);

    } catch (error) {

      console.error('Search parsing error', error);

      setResults([]);

    }

  };

  return (

    <div>

      <input

        value={query}

        onChange={(e) => setQuery(e.target.value)}

        placeholder="Search posts..."

        className="border p-2 mr-2 rounded bg-slate-700 text-slate-100 placeholder:text-slate-400 w-full mb-2"

      />

      <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded w-full">Search</button>

      <div className="mt-2 space-y-2">

        {results.map((post) => (

          <div key={post._id} className="border p-2 bg-slate-700 rounded text-slate-100">

            <p><strong>{post.author}</strong>: {post.text}</p>

          </div>

        ))}

      </div>

    </div>

  );

}