'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { api } from '@/lib/api';
import { ActivityItem } from '@/lib/types';
import { SystemBar } from '@/components/os/SystemBar';
import { StatusBar } from '@/components/os/StatusBar';
import { TargetCursor } from '@/components/os/TargetCursor';
import { CopilotWidget } from '@/components/ai/CopilotWidget';
import { Footer } from '@/components/os/Footer';
import { Trophy, Gauge, Sparkles, Users2 } from 'lucide-react';
import Link from 'next/link';

const normalizeActivity = (payload: unknown): ActivityItem[] => {
  if (!Array.isArray(payload)) return [];
  return payload.reduce<ActivityItem[]>((acc, e) => {
    const item = e as Record<string, unknown>;
    if (typeof item._id !== 'string' && typeof item.id !== 'string') return acc;
    const user = (item.user || {}) as Record<string, unknown>;
    acc.push({ id: (typeof item.id === 'string' ? item.id : item._id) as string, type: typeof item.type === 'string' ? item.type : 'system', message: typeof item.message === 'string' ? item.message : 'System activity.', createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(), user: { id: typeof user.id === 'string' ? user.id : undefined, username: typeof user.username === 'string' ? user.username : undefined, avatar: typeof user.avatar === 'string' ? user.avatar : undefined } });
    return acc;
  }, []);
};

export default function StatsPage() {
  const { user, fetchMe } = useAuthStore();
  const { setModule } = useUiStore();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setModule('System Status', 'Dashboard / Stats'); }, [setModule]);
  useEffect(() => { fetchMe().catch(() => undefined); }, [fetchMe]);

  useEffect(() => {
    let active = true;
    if (!user?.id) { setLoading(false); return; }

    api.get('/social/activity').then((res) => {
      if (!active) return;
      setActivity(normalizeActivity(res.data.activity));
    }).catch(() => undefined).finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [user?.id]);

  const statTiles = [
    { label: 'Pilot Level', value: user ? `LVL ${user.stats.level}` : 'Guest', detail: user ? `${user.stats.xp} XP synced` : 'Login to sync', icon: Trophy },
    { label: 'Achievements', value: user ? String(user.stats.achievements) : '0', detail: 'Milestones unlocked', icon: Sparkles },
    { label: 'XP Total', value: user ? String(user.stats.xp) : '0', detail: 'Experience accumulated', icon: Gauge },
    { label: 'Status', value: user ? 'Online' : 'Offline', detail: user ? 'Pilot active' : 'Not authenticated', icon: Users2 },
  ];

  return (
    <main className='min-h-screen px-4 pb-32'>
      <TargetCursor />
      <SystemBar />
      <CopilotWidget />

      <div className='mx-auto max-w-[1440px] pt-24'>
        <div className='glass panel-glow rounded-[1.8rem] p-6 mb-6'>
          <div className='hud-label mb-2'>Stats Module</div>
          <h1 className='typewriter font-heading text-3xl uppercase tracking-[0.24em] text-white'>System Status</h1>
          <p className='mt-3 text-sm leading-6 text-secondary'>Your pilot stats, achievements, and recent activity across the NEXUS network.</p>
        </div>

        {!user && (
          <div className='glass panel-glow rounded-[1.8rem] p-5 mb-6'>
            <div className='font-heading text-lg uppercase tracking-[0.24em] text-white'>Login Required</div>
            <p className='mt-3 text-sm leading-6 text-secondary'>Sign in to view your pilot stats and activity feed.</p>
            <div className='mt-4 flex gap-3'>
              <Link href='/login' className='rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.16]'>Login</Link>
            </div>
          </div>
        )}

        <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6'>
          {statTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div key={tile.label} className='glass panel-glow rounded-[1.6rem] p-5'>
                <div className='mb-4 flex items-center justify-between'>
                  <div className='hud-label'>{tile.label}</div>
                  <Icon className='h-4 w-4 text-white' />
                </div>
                <div className='text-2xl font-semibold text-white'>{tile.value}</div>
                <div className='mt-2 text-sm text-secondary'>{tile.detail}</div>
              </div>
            );
          })}
        </section>

        <div className='glass panel-glow rounded-[1.8rem] p-5'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <div className='hud-label mb-2'>Activity Feed</div>
              <div className='font-heading text-lg uppercase tracking-[0.24em] text-white'>Recent Actions</div>
            </div>
            <div className='text-xs uppercase tracking-[0.22em] text-secondary'>{loading ? 'Syncing...' : `${activity.length} events`}</div>
          </div>

          <div className='space-y-3'>
            {loading && !activity.length && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='rounded-2xl border border-white/10 bg-black/[0.35] p-4'>
                <div className='h-4 w-2/3 rounded-full bg-white/10' />
                <div className='mt-3 h-3 w-full rounded-full bg-white/[0.08]' />
              </div>
            ))}

            {!loading && !activity.length && (
              <div className='rounded-2xl border border-white/10 bg-black/[0.35] p-4 text-sm text-secondary'>
                Activity telemetry will stream here once you start moving through NEXUS.
              </div>
            )}

            {activity.map((entry) => (
              <div key={entry.id} className='rounded-2xl border border-white/10 bg-black/[0.35] p-4'>
                <div className='mb-2 flex items-center gap-3'>
                  <img src={entry.user?.avatar || 'https://api.dicebear.com/9.x/bottts/svg?seed=nexus-activity'} alt={entry.user?.username || 'pilot'} className='h-9 w-9 rounded-full border border-white/10' />
                  <div>
                    <div className='text-sm text-white'>{entry.user?.username || 'NEXUS Core'}</div>
                    <div className='text-[11px] uppercase tracking-[0.18em] text-secondary'>
                      {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className='text-sm leading-6 text-secondary'>{entry.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <StatusBar />
    </main>
  );
}
