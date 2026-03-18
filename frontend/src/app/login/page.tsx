'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { getApiErrorMessage } from '@/lib/api';
import { useUiStore } from '@/store/ui';
import { SystemBar } from '@/components/os/SystemBar';
import { StatusBar } from '@/components/os/StatusBar';
import { TargetCursor } from '@/components/os/TargetCursor';
import { Footer } from '@/components/os/Footer';

export default function LoginPage() {
  const { login, loading, user } = useAuthStore();
  const { setModule } = useUiStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setModule('Access Gate', 'Authentication / Login');
  }, [setModule]);

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [router, user]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.push('/');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Login failed'));
    }
  };

  return (
    <main className='min-h-screen px-4 pb-28'>
      <TargetCursor />
      <SystemBar />

      <div className='mx-auto flex min-h-screen max-w-5xl items-center justify-center pt-16'>
        <div className='grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]'>
          <div className='glass panel-glow rounded-[2rem] p-6'>
            <div className='hud-label mb-3'>NEXUS Login</div>
            <h1 className='font-heading text-3xl uppercase tracking-[0.24em] text-white'>Access Gate</h1>
            <p className='mt-4 text-sm leading-7 text-secondary'>
              Reconnect your pilot profile to restore AI recommendations, social presence, XP tracking, and your command deck state.
            </p>
          </div>

          <form onSubmit={onSubmit} className='glass panel-glow w-full rounded-[2rem] p-6 md:p-8'>
            <h2 className='typewriter mb-6 font-heading text-2xl uppercase tracking-[0.24em]'>Authenticate Pilot</h2>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='mb-4 w-full rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-sm text-white'
              placeholder='Email'
              disabled={loading}
            />
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='mb-4 w-full rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-sm text-white'
              placeholder='Password'
              disabled={loading}
            />

            {error && <p className='mb-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200'>{error}</p>}

            <button disabled={loading} className='w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white transition hover:bg-white/[0.15] disabled:opacity-60'>
              {loading ? 'Authorizing...' : 'Login'}
            </button>

            <p className='mt-4 text-sm text-secondary'>
              No account yet?{' '}
              <Link href='/signup' className='text-white underline underline-offset-4'>
                Create Pilot ID
              </Link>
            </p>
          </form>
        </div>
      </div>

      <Footer />
      <StatusBar />
    </main>
  );
}
