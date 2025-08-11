'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 border-2 border-black rounded bg-white">
      <h2 className="text-xl font-bold mb-4 font-mono text-black">
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-sm font-bold text-black font-mono mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded font-mono bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Your name"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-bold text-black font-mono mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border-2 border-black rounded font-mono bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-black font-mono mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border-2 border-black rounded font-mono bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Password"
          />
        </div>
        
        {error && (
          <div className="text-black text-sm font-mono bg-gray-100 p-2 border border-black rounded">
            Error: {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 px-4 rounded font-mono font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin mr-2">⟳</span>
              Loading...
            </>
          ) : (
            isSignUp ? 'Sign Up' : 'Sign In'
          )}
        </button>
      </form>
      
      <p className="mt-4 text-center text-sm font-mono text-black">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-black hover:underline font-bold"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
}