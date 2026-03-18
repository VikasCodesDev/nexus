'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { SystemBar } from '@/components/os/SystemBar';
import { StatusBar } from '@/components/os/StatusBar';
import { TargetCursor } from '@/components/os/TargetCursor';
import { Footer } from '@/components/os/Footer';

type ProfileResponse = {
  user: {
    avatar: string;
    username: string;
    email: string;
    stats: {
      level: number;
      xp: number;
      achievements: number;
    };
    favoriteGames: string[];
  };
  settings?: {
    theme?: 'dark' | 'midnight';
    soundEnabled?: boolean;
  };
};

export default function ProfilePage() {
  const { user, fetchMe, logout, initialized } = useAuthStore();
  const { setModule, setSoundEnabled: syncSoundEnabled } = useUiStore();
  const router = useRouter();
  const [theme, setTheme] = useState<'dark' | 'midnight'>('dark');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [favoriteGames, setFavoriteGames] = useState<string[]>([]);
  const [booting, setBooting] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setModule('Pilot Profile', 'Profile / Pilot Settings');
  }, [setModule]);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const authUser = await fetchMe();
      if (!active) return;

      if (!authUser) {
        router.replace('/login');
        return;
      }

      try {
        const res = await api.get<ProfileResponse>('/users/profile');
        if (!active) return;
        setTheme(res.data.settings?.theme || 'dark');
        syncSoundEnabled(res.data.settings?.soundEnabled ?? true);
        setSoundEnabled(res.data.settings?.soundEnabled ?? true);
        setFavoriteGames(res.data.user.favoriteGames || []);
      } catch (error) {
        if (!active) return;
        setStatus(getApiErrorMessage(error, 'Unable to load profile settings.'));
      } finally {
        if (active) {
          setBooting(false);
        }
      }
    };

    loadProfile().catch(() => {
      if (!active) return;
      setBooting(false);
    });

    return () => {
      active = false;
    };
  }, [fetchMe, router]);

  if (booting || !initialized) {
    return (
      <main className='min-h-screen px-4 pb-28'>
        <TargetCursor />
        <SystemBar />
        <div className='mx-auto flex min-h-screen max-w-4xl items-center justify-center pt-16'>
          <div className='glass panel-glow rounded-[2rem] px-6 py-4 text-sm text-secondary'>Loading pilot profile...</div>
        </div>
        <StatusBar />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className='min-h-screen px-4 pb-28'>
      <TargetCursor />
      <SystemBar />

      <div className='mx-auto max-w-6xl pt-24'>
        <div className='grid gap-6 xl:grid-cols-[0.85fr_1.15fr]'>
          <div className='glass panel-glow rounded-[2rem] p-6'>
            <div className='hud-label mb-3'>Pilot Identity</div>
            <div className='mb-6 flex items-center gap-4'>
              <img src={user.avatar} alt={user.username} className='h-20 w-20 rounded-full border border-white/20 bg-black/40' />
              <div>
                <div className='font-heading text-2xl uppercase tracking-[0.2em] text-white'>{user.username}</div>
                <div className='mt-1 text-sm text-secondary'>{user.email}</div>
              </div>
            </div>

            <div className='grid gap-3 md:grid-cols-3 xl:grid-cols-1'>
              <div className='rounded-[1.5rem] border border-white/10 bg-black/[0.35] p-4'>
                <div className='hud-label mb-2'>Level</div>
                <div className='text-2xl font-semibold text-white'>{user.stats.level}</div>
              </div>
              <div className='rounded-[1.5rem] border border-white/10 bg-black/[0.35] p-4'>
                <div className='hud-label mb-2'>XP</div>
                <div className='text-2xl font-semibold text-white'>{user.stats.xp}</div>
              </div>
              <div className='rounded-[1.5rem] border border-white/10 bg-black/[0.35] p-4'>
                <div className='hud-label mb-2'>Achievements</div>
                <div className='text-2xl font-semibold text-white'>{user.stats.achievements}</div>
              </div>
            </div>
          </div>

          <div className='glass panel-glow rounded-[2rem] p-6'>
            <div className='hud-label mb-3'>System Settings</div>
            <h1 className='font-heading text-2xl uppercase tracking-[0.24em] text-white'>Pilot Control Center</h1>

            <div className='mt-6 grid gap-4 md:grid-cols-2'>
              <div className='rounded-[1.5rem] border border-white/10 bg-black/[0.35] p-4'>
                <label className='hud-label mb-3 block'>Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'dark' | 'midnight')}
                  className='w-full rounded-2xl border border-white/[0.15] bg-black/[0.55] px-4 py-3 text-sm text-white'
                >
                  <option value='dark'>Dark</option>
                  <option value='midnight'>Midnight</option>
                </select>
              </div>

              <div className='rounded-[1.5rem] border border-white/10 bg-black/[0.35] p-4'>
                <div className='hud-label mb-3'>Audio</div>
                <label className='flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white'>
                  <input
                    type='checkbox'
                    checked={soundEnabled}
                    onChange={(e) => {
                      const next = e.target.checked;
                      syncSoundEnabled(next);
                      setSoundEnabled(next);
                    }}
                  />
                  Sound enabled
                </label>
              </div>
            </div>

            <div className='mt-6 rounded-[1.5rem] border border-white/10 bg-black/[0.35] p-4'>
              <div className='hud-label mb-3'>Favorite Games</div>
              <div className='flex flex-wrap gap-2'>
                {favoriteGames.length ? (
                  favoriteGames.map((game) => (
                    <span key={game} className='rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-secondary'>
                      {game}
                    </span>
                  ))
                ) : (
                  <div className='text-sm text-secondary'>Favorite games will appear here as your profile evolves.</div>
                )}
              </div>
            </div>

            {status && <div className='mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-secondary'>{status}</div>}

            <div className='mt-6 flex flex-wrap gap-3'>
              <button
                onClick={async () => {
                  setSaving(true);
                  setStatus('');
                  try {
                    await api.patch('/users/settings', { theme, soundEnabled });
                    setStatus('Settings synced to NEXUS.');
                  } catch (error) {
                    setStatus(getApiErrorMessage(error, 'Unable to save settings.'));
                  } finally {
                    setSaving(false);
                  }
                }}
                className='rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white transition hover:bg-white/[0.15] disabled:opacity-60'
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>

              <button
                onClick={async () => {
                  await logout();
                  router.push('/login');
                }}
                className='rounded-2xl border border-white/[0.12] bg-transparent px-4 py-3 text-sm text-secondary transition hover:bg-white/[0.08] hover:text-white'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <StatusBar />
    </main>
  );
}
