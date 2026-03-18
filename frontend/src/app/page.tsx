'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Gauge, Newspaper, Sparkles, Trophy, Users2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { api } from '@/lib/api';
import { Game } from '@/lib/types';
import { SystemBar } from '@/components/os/SystemBar';
import { HeroCarousel } from '@/components/os/HeroCarousel';
import { StatusBar } from '@/components/os/StatusBar';
import { TargetCursor } from '@/components/os/TargetCursor';
import { CopilotWidget } from '@/components/ai/CopilotWidget';
import { Footer } from '@/components/os/Footer';

const ControllerScene = dynamic(
  () => import('@/components/three/ControllerScene').then((mod) => mod.ControllerScene),
  { ssr: false }
);

export default function HomePage() {
  const { user, fetchMe } = useAuthStore();
  const { setModule } = useUiStore();

  const [trending, setTrending] = useState<Game[]>([]);
  const [gameCount, setGameCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);

  useEffect(() => {
    setModule('Command Deck', 'Dashboard / Command Deck');
    fetchMe().catch(() => undefined);
  }, [fetchMe, setModule]);

  useEffect(() => {
    let active = true;

    Promise.allSettled([api.get('/games'), api.get('/news')]).then(([gamesResult, newsResult]) => {
      if (!active) return;
      if (gamesResult.status === 'fulfilled') {
        const d = gamesResult.value.data;
        setTrending(d.trending || []);
        setGameCount(
          (d.trending?.length || 0) + (d.topRated?.length || 0) +
          (d.multiplayer?.length || 0) + (d.newReleases?.length || 0)
        );
      }
      if (newsResult.status === 'fulfilled') {
        setNewsCount((newsResult.value.data.news || []).length);
      }
    });

    return () => { active = false; };
  }, []);

  const systemTiles = [
    { label: 'Pilot Level', value: user ? `LVL ${user.stats.level}` : 'Guest', detail: user ? `${user.stats.xp} XP synced` : 'Login to sync progress', icon: Trophy },
    { label: 'Game Rows', value: String(gameCount), detail: 'Curated library entries active', icon: Gauge },
    { label: 'Social Link', value: user ? 'Connected' : 'Offline', detail: 'Squad presence tracking', icon: Users2 },
    { label: 'News Pulse', value: `${newsCount} Live`, detail: 'Briefings flowing into command deck', icon: Newspaper },
  ];

  return (
    <main className='min-h-screen px-4 pb-32'>
      <TargetCursor />
      <SystemBar />
      <CopilotWidget />

      <div className='mx-auto max-w-[1440px] pt-24'>
        {/* NEXUS Main Title */}
        <div className='mb-6 text-center'>
          <h1 className='typewriter mx-auto font-heading text-5xl uppercase tracking-[0.35em] text-white md:text-6xl'>NEXUS</h1>
          <p className='mt-3 text-sm uppercase tracking-[0.28em] text-secondary'>Gaming Operating System</p>
        </div>

        <div className='grid gap-4 xl:grid-cols-[1.2fr_0.8fr] xl:grid-rows-[280px_184px] xl:h-[480px]'>
          <div className='xl:row-span-2 xl:h-full'>
            <HeroCarousel games={trending} />
          </div>

          <div className='xl:h-full'>
            <ControllerScene />
          </div>

          <div className='space-y-4 xl:h-full'>
            {!user && (
              <div className='glass panel-glow rounded-[1.8rem] p-5'>
                <div className='hud-label mb-2'>Access Gate</div>
                <div className='font-heading text-lg uppercase tracking-[0.24em] text-white'>Authenticate</div>
                <p className='mt-3 text-sm leading-6 text-secondary'>
                  Sign in to unlock AI + Realtime.
                </p>
                <div className='mt-4 flex flex-wrap gap-3'>
                  <Link href='/login' className='rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.16]'>
                    Login
                  </Link>
                </div>
              </div>
            )}

            <div className='glass panel-glow rounded-[1.8rem] p-6 h-[184px] flex flex-col justify-center'>
              <div className='hud-label mb-3'>Mission Brief</div>
              <div className='flex items-start justify-between gap-6'>
                <div>
                  <div className='font-heading text-xl uppercase tracking-[0.24em] text-white mb-3'>Gaming OS Online</div>
                  <p className='text-xs leading-6 text-secondary max-sm:hidden'>
                    Operational readiness confirmed. Your command deck is optimized for discovery and squad coordination.
                  </p>
                </div>
                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md'>
                  <Sparkles className='h-6 w-6 text-white' />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Tiles */}
        <section className='mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {systemTiles.map((tile) => {
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
      </div>

      <Footer />
      <StatusBar />
    </main>
  );
}
