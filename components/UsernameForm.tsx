import { useState, useEffect } from 'react';

import Image from 'next/image';

interface Props {

  onSet: (u: string) => void;

  error?: string;

}

export default function UsernameForm({ onSet, error }: Props) {

  const [u, setU] = useState('');

  const [localError, setLocalError] = useState('');

  useEffect(() => {

    if (error) {

      setLocalError(error);

    }

  }, [error]);

  const handleSubmit = () => {

    if (u.trim()) {

      setLocalError('');

      onSet(u.trim());

    }

  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === 'Enter') {

      handleSubmit();

    }

  };

  return (

    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">

      <div className="bg-slate-800 p-6 rounded-3xl shadow-lg shadow-black/20 backdrop-blur max-w-md w-full">

        <div className="flex justify-center mb-6">

          <Image src="/logo.png" alt="Whspr logo" width={120} height={120} className="rounded-full" />

        </div>

        <h2 className="text-xl mb-4 text-center">Enter your username</h2>

        {localError && <p className="text-red-500 mb-4 text-center">{localError}</p>}

        <input

          value={u}

          onChange={(e) => setU(e.target.value)}

          onKeyPress={handleKeyPress}

          placeholder="Username"

          className="border-0 bg-slate-700 text-slate-100 p-4 rounded-3xl w-full mb-4 outline-none"

          autoFocus

          required

        />

        <button onClick={handleSubmit} onTouchStart={handleSubmit} className="bg-blue-500 text-white p-4 rounded-3xl w-full hover:bg-blue-600 transition mb-4">Enter</button>

        <p className="text-xs text-slate-400 italic text-center">We need access to your location for post recommendation <span className="font-semibold">*only*</span>, we have a strict <span className="font-semibold">*no logs*</span> policy</p>

      </div>

    </div>

  );

}