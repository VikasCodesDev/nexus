'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Game } from '@/lib/types';
import { MagneticButton } from './MagneticButton';
import { ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function HeroCarousel({ games }: { games: Game[] }) {
  const [index, setIndex] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const parallaxX = useSpring(mouseX, { stiffness: 120, damping: 18 });
  const parallaxY = useSpring(mouseY, { stiffness: 120, damping: 18 });

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % Math.max(games.length, 1)), 5000);
    return () => clearInterval(t);
  }, [games.length]);

  if (!games.length) {
    return (
      <section className='glass panel-glow relative mt-24 min-h-[420px] overflow-hidden rounded-[2rem] p-8'>
        <div className='hud-label mb-4'>Featured Panel</div>
        <div className='h-10 w-56 rounded-full bg-white/[0.08]' />
        <div className='mt-4 h-4 w-full max-w-xl rounded-full bg-white/[0.08]' />
        <div className='mt-2 h-4 w-full max-w-lg rounded-full bg-white/[0.06]' />
        <div className='mt-8 flex gap-3'>
          <div className='h-12 w-36 rounded-2xl bg-white/[0.08]' />
          <div className='h-12 w-36 rounded-2xl bg-white/[0.06]' />
        </div>
      </section>
    );
  }
  const game = games[index];

  return (
    <section
      id='hero'
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mouseX.set((event.clientX - rect.left - rect.width / 2) * 0.04);
        mouseY.set((event.clientY - rect.top - rect.height / 2) * 0.04);
      }}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
      className='glass panel-glow relative h-[480px] min-h-[480px] max-h-[480px] overflow-hidden rounded-[2.5rem]'
    >
      <AnimatePresence mode='wait'>
        <motion.div key={game.id} className='absolute inset-0' style={{ x: parallaxX, y: parallaxY }}>
          <motion.img
            src={game.image}
            alt={game.title}
            className='absolute inset-0 h-full w-full scale-110 object-cover opacity-90'
            initial={{ scale: 1.18, opacity: 0 }}
            animate={{ scale: 1.08, opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
          />
        </motion.div>
      </AnimatePresence>

      <div className='absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent' />
      <div className='absolute inset-0 bg-black/30' />

      <div className='relative z-10 grid h-full items-center gap-8 p-8 lg:grid-cols-[1fr_320px] lg:p-10'>
        <div className='flex flex-col justify-between text-left min-w-0 h-full py-2'>
          <div>
            <div className='hud-label mb-5'>Featured Operative</div>
            
            <h1 className='font-heading mb-4 text-4xl uppercase tracking-[0.2em] text-white md:text-5xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] line-clamp-2 break-words leading-tight h-[2.4em] flex items-center overflow-hidden'>
              {game.title}
            </h1>

            <div className='mb-6 flex flex-wrap gap-2 h-[32px] overflow-hidden items-center'>
              <span className='rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-[10px] text-white backdrop-blur-md uppercase tracking-widest'>{game.genre.join(' / ')}</span>
              <span className='rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-[10px] text-white backdrop-blur-md uppercase tracking-widest'>{game.multiplayer ? 'Squad Ready' : 'Solo Deck'}</span>
              <span className='rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-bold text-white backdrop-blur-md'>★ {game.rating}</span>
            </div>

            <p className='max-w-xl text-md leading-7 text-white/90 drop-shadow-md line-clamp-2 h-[3.5em] overflow-hidden'>
              {game.description}
            </p>
          </div>

          <div className='mt-6 flex flex-wrap gap-4 shrink-0'>
            <MagneticButton className='min-w-[170px] bg-white text-black font-extrabold h-14 rounded-2xl shrink-0'>
              <span className='flex items-center justify-center gap-2 uppercase tracking-[0.12em] text-xs'>
                <Play className='h-5 w-5 fill-current' />
                Launch System
              </span>
            </MagneticButton>
            <Link href='/profile' className='inline-flex min-w-[170px] items-center justify-center gap-2 rounded-2xl border border-white/30 bg-black/50 px-6 py-4 text-xs font-extrabold uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:bg-white/10 shrink-0'>
              <Sparkles className='h-5 w-5' />
              User Profile
            </Link>
          </div>
        </div>

        <div className='h-[420px] w-[320px] flex flex-col justify-between rounded-[2.2rem] border border-white/15 bg-black/45 p-8 backdrop-blur-3xl shadow-2xl shrink-0'>
          <div className='shrink-0'>
            <div className='hud-label mb-5'>Command Snapshot</div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='rounded-[1.4rem] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10'>
                <div className='text-3xl font-black text-white'>{game.rating}</div>
                <div className='mt-2 text-[8px] uppercase tracking-widest text-secondary font-black'>Rating</div>
              </div>
              <div className='rounded-[1.4rem] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10'>
                <div className='text-3xl font-black text-white'>{new Date(game.releaseDate).getFullYear()}</div>
                <div className='mt-2 text-[8px] uppercase tracking-widest text-secondary font-black'>Year</div>
              </div>
            </div>
          </div>

          <div className='mt-8 space-y-4 flex-1 overflow-hidden pointer-events-auto'>
            <div className='hud-label mb-3'>Rotation Stream</div>
            <div className='space-y-3'>
              {games.slice(0, 3).map((queuedGame, queuedIndex) => (
                <button
                  key={queuedGame.id}
                  onClick={() => setIndex(queuedIndex)}
                  className={`flex w-full items-center gap-4 rounded-[1.2rem] border p-2.5 text-left transition-all duration-300 h-[64px] ${
                    queuedGame.id === game.id 
                      ? 'border-white/30 bg-white/15' 
                      : 'border-white/5 bg-black/20 hover:bg-white/5'
                  }`}
                >
                  <img src={queuedGame.image} alt={queuedGame.title} className='h-10 w-10 rounded-xl object-cover shadow-lg shrink-0' />
                  <div className='min-w-0 flex-1'>
                    <div className='truncate text-[11px] font-black text-white uppercase tracking-wider'>{queuedGame.title}</div>
                    <div className='truncate text-[9px] uppercase tracking-widest text-secondary'>{queuedGame.genre[0]} / NEXUS</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button onClick={() => setIndex((i) => (i - 1 + games.length) % games.length)} className='absolute left-4 top-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-lg'>
        <ChevronLeft />
      </button>
      <button onClick={() => setIndex((i) => (i + 1) % games.length)} className='absolute right-4 top-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-lg'>
        <ChevronRight />
      </button>

      <div className='absolute bottom-5 left-7 flex gap-2'>
        {games.slice(0, 5).map((dotGame, dotIndex) => (
          <button
            key={dotGame.id}
            onClick={() => setIndex(dotIndex)}
            className={`h-2.5 rounded-full transition ${dotIndex === index ? 'w-10 bg-white' : 'w-2.5 bg-white/35'}`}
          />
        ))}
      </div>
    </section>
  );
}
