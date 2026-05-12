import { useState, useEffect } from 'react';

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

    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <div className="bg-white p-6 rounded shadow-md">

        <h2 className="text-xl mb-4">Enter your username</h2>

        {localError && <p className="text-red-500 mb-4">{localError}</p>}

        <input

          value={u}

          onChange={(e) => setU(e.target.value)}

          onKeyPress={handleKeyPress}

          placeholder="Username"

          className="border p-2 w-full mb-4"

          autoFocus

          required

        />

        <button onClick={handleSubmit} onTouchStart={handleSubmit} className="bg-blue-500 text-white p-2 w-full">Enter</button>

      </div>

    </div>

  );

}