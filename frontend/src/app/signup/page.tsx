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

export default function SignupPage() {
  const { signup, loading, user } = useAuthStore();
  const { setModule } = useUiStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setModule('Pilot Provisioning', 'Authentication / Sign Up');
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
      await signup(username, email, password);
      router.push('/');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Sign up failed'));
    }
  };

  return (
    <main className='min-h-screen px-4 pb-28'>
      <TargetCursor />
      <SystemBar />

      <div className='mx-auto flex min-h-screen max-w-5xl items-center justify-center pt-16'>
        <div className='grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]'>
          <div className='glass panel-glow rounded-[2rem] p-6'>
            <div className='hud-label mb-3'>Pilot Provisioning</div>
            <h1 className='font-heading text-3xl uppercase tracking-[0.24em] text-white'>Create Pilot ID</h1>
            <p className='mt-4 text-sm leading-7 text-secondary'>
              Start a new NEXUS identity with synced settings, AI copiloting, social presence, achievements, and realtime dashboard activity.
            </p>
          </div>

          <form onSubmit={onSubmit} className='glass panel-glow w-full rounded-[2rem] p-6 md:p-8'>
            <h2 className='typewriter mb-6 font-heading text-2xl uppercase tracking-[0.24em]'>Initialize Profile</h2>

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='mb-4 w-full rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-sm text-white'
              placeholder='Username'
              disabled={loading}
            />
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
              {loading ? 'Provisioning...' : 'Create Account'}
            </button>

            <p className='mt-4 text-sm text-secondary'>
              Already have an account?{' '}
              <Link href='/login' className='text-white underline underline-offset-4'>
                Login
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
