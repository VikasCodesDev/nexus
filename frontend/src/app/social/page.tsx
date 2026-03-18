'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useSocialStore } from '@/store/social';
import { useUiStore } from '@/store/ui';
import { api } from '@/lib/api';
import { ActivityItem, SocialFriend } from '@/lib/types';
import { SystemBar } from '@/components/os/SystemBar';
import { StatusBar } from '@/components/os/StatusBar';
import { TargetCursor } from '@/components/os/TargetCursor';
import { SocialPanel } from '@/components/social/SocialPanel';
import { CopilotWidget } from '@/components/ai/CopilotWidget';
import { Footer } from '@/components/os/Footer';
import Link from 'next/link';

const fallbackFriends: SocialFriend[] = [
  { id: 'friend-phantom', username: 'Phantom', avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=phantom', online: true },
  { id: 'friend-nova', username: 'Nova', avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=nova', online: false },
  { id: 'friend-rift', username: 'Rift', avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=rift', online: true },
];

const fallbackActivity: ActivityItem[] = [
  { id: 'activity-1', type: 'system', message: 'Phantom queued into a co-op strike.', createdAt: new Date().toISOString(), user: { username: 'Phantom', avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=phantom' } },
  { id: 'activity-2', type: 'system', message: 'Nova synced their profile.', createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), user: { username: 'Nova', avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=nova' } },
];

const normalizeFriends = (payload: unknown): SocialFriend[] => {
  if (!Array.isArray(payload)) return [];
  return payload.reduce<SocialFriend[]>((acc, f) => {
    const item = f as Record<string, unknown>;
    if (typeof item.id !== 'string') return acc;
    acc.push({ id: item.id, username: (typeof item.username === 'string' ? item.username : 'Unknown Pilot'), avatar: (typeof item.avatar === 'string' ? item.avatar : 'https://api.dicebear.com/9.x/bottts/svg?seed=nexus'), online: Boolean(item.online), lastSeen: typeof item.lastSeen === 'string' ? item.lastSeen : undefined, friendshipId: typeof item.friendshipId === 'string' ? item.friendshipId : undefined });
    return acc;
  }, []);
};

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

export default function SocialPage() {
  const { user, fetchMe } = useAuthStore();
  const { connect, disconnect } = useSocialStore();
  const { setModule } = useUiStore();
  const [friends, setFriends] = useState<SocialFriend[]>(fallbackFriends);
  const [activity, setActivity] = useState<ActivityItem[]>(fallbackActivity);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setModule('Squad Link', 'Dashboard / Social'); }, [setModule]);
  useEffect(() => { fetchMe().catch(() => undefined); }, [fetchMe]);

  useEffect(() => {
    if (user?.id) { connect(user.id); }
    return () => disconnect();
  }, [connect, disconnect, user?.id]);

  useEffect(() => {
    let active = true;
    if (!user?.id) { setLoading(false); return; }

    Promise.allSettled([api.get('/social/friends'), api.get('/social/activity')]).then(([fr, ar]) => {
      if (!active) return;
      const nextFriends = fr.status === 'fulfilled' ? normalizeFriends(fr.value.data.friends) : [];
      const nextActivity = ar.status === 'fulfilled' ? normalizeActivity(ar.value.data.activity) : [];
      setFriends(nextFriends.length ? nextFriends : fallbackFriends);
      setActivity(nextActivity.length ? nextActivity : fallbackActivity);
      setLoading(false);
    });

    return () => { active = false; };
  }, [user?.id]);

  return (
    <main className='min-h-screen px-4 pb-32'>
      <TargetCursor />
      <SystemBar />
      <CopilotWidget />

      <div className='mx-auto max-w-[1440px] pt-24'>
        <div className='glass panel-glow rounded-[1.8rem] p-6 mb-6'>
          <div className='hud-label mb-2'>Social Module</div>
          <h1 className='typewriter font-heading text-3xl uppercase tracking-[0.24em] text-white'>Squad Link</h1>
          <p className='mt-3 text-sm leading-6 text-secondary'>Manage your squad, send pings, and track activity across the network.</p>
        </div>

        {!user && (
          <div className='glass panel-glow rounded-[1.8rem] p-5 mb-6'>
            <div className='font-heading text-lg uppercase tracking-[0.24em] text-white'>Login Required</div>
            <p className='mt-3 text-sm leading-6 text-secondary'>Sign in to access your squad, friends list, and real-time activity feed.</p>
            <div className='mt-4 flex gap-3'>
              <Link href='/login' className='rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.16]'>Login</Link>
              <Link href='/signup' className='rounded-2xl border border-white/[0.12] bg-transparent px-4 py-2.5 text-sm text-secondary transition hover:bg-white/[0.08] hover:text-white'>Create Pilot ID</Link>
            </div>
          </div>
        )}

        <SocialPanel friends={friends} activity={activity} loading={loading && Boolean(user)} />
      </div>

      <Footer />
      <StatusBar />
    </main>
  );
}
