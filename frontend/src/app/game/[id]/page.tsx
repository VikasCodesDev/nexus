'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Game } from '@/lib/types';
import { api } from '@/lib/api';
import { SystemBar } from '@/components/os/SystemBar';
import { StatusBar } from '@/components/os/StatusBar';
import { TargetCursor } from '@/components/os/TargetCursor';
import { CopilotWidget } from '@/components/ai/CopilotWidget';
import { Footer } from '@/components/os/Footer';
import { ArrowLeft, Calendar, DollarSign, Gamepad2, Layers, Play, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GameDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    api.get(`/games/${id}`)
      .then((res) => {
        setGame(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch game details');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main className='min-h-screen px-4 pb-32 flex items-center justify-center'>
        <div className='text-white font-heading uppercase tracking-widest animate-pulse'>Loading Mission Data...</div>
      </main>
    );
  }

  if (error || !game) {
    return (
      <main className='min-h-screen px-4 pb-32 flex flex-col items-center justify-center gap-6'>
        <div className='text-red-400 font-heading uppercase tracking-widest'>{error || 'Game Not Found'}</div>
        <button 
          onClick={() => router.back()}
          className='glass px-6 py-3 rounded-2xl text-white flex items-center gap-2 hover:bg-white/10 transition'
        >
          <ArrowLeft className='h-4 w-4' /> Return to Deck
        </button>
      </main>
    );
  }

  return (
    <main className='min-h-screen px-4 pb-32'>
      <TargetCursor />
      <SystemBar />
      <CopilotWidget />

      <div className='mx-auto max-w-[1200px] pt-24'>
        <button 
          onClick={() => router.back()}
          className='mb-8 flex items-center gap-2 text-secondary hover:text-white transition uppercase text-xs tracking-[0.2em]'
        >
          <ArrowLeft className='h-4 w-4' /> Back to Library
        </button>

        <div className='grid gap-8 lg:grid-cols-[1fr_400px]'>
          <div className='space-y-8'>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='glass panel-glow overflow-hidden rounded-[2.5rem]'
            >
              <div className='relative h-[400px] w-full'>
                <img src={game.image} alt={game.title} className='h-full w-full object-cover' />
                <div className='absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent' />
                <div className='absolute bottom-8 left-8 right-8'>
                  <div className='hud-label mb-4'>Operational Title</div>
                  <h1 className='font-heading text-5xl uppercase tracking-[0.2em] text-white md:text-6xl'>{game.title}</h1>
                </div>
              </div>

              <div className='p-8'>
                <div className='hud-label mb-4'>Mission Intelligence</div>
                <p className='text-lg leading-8 text-secondary'>{game.description}</p>
                
                <div className='mt-8 grid grid-cols-2 gap-4 md:grid-cols-4'>
                  <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                    <div className='mb-2 flex items-center gap-2 text-secondary'>
                      <Layers className='h-4 w-4' />
                      <span className='text-[10px] uppercase tracking-widest'>Genre</span>
                    </div>
                    <div className='text-sm text-white font-medium'>{game.genre.join(', ')}</div>
                  </div>
                  <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                    <div className='mb-2 flex items-center gap-2 text-secondary'>
                      <Star className='h-4 w-4 text-yellow-500' />
                      <span className='text-[10px] uppercase tracking-widest'>Rating</span>
                    </div>
                    <div className='text-sm text-white font-medium'>{game.rating} / 10</div>
                  </div>
                  <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                    <div className='mb-2 flex items-center gap-2 text-secondary'>
                      <Calendar className='h-4 w-4' />
                      <span className='text-[10px] uppercase tracking-widest'>Release</span>
                    </div>
                    <div className='text-sm text-white font-medium'>{new Date(game.releaseDate).getFullYear()}</div>
                  </div>
                  <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                    <div className='mb-2 flex items-center gap-2 text-secondary'>
                      <Users className='h-4 w-4' />
                      <span className='text-[10px] uppercase tracking-widest'>Modes</span>
                    </div>
                    <div className='text-sm text-white font-medium'>{game.multiplayer ? 'Multiplayer' : 'Singleplayer'}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className='space-y-6'
          >
            <div className='glass panel-glow rounded-[2rem] p-6'>
              <div className='hud-label mb-4'>Acquisition</div>
              <div className='mb-6 flex items-center justify-between'>
                <div className='flex items-center gap-2 text-white'>
                  {game.price === 'Free' ? (
                    <span className='text-2xl font-bold text-green-400'>FREE ACCESS</span>
                  ) : (
                    <div className='flex flex-col'>
                      <span className='text-xs uppercase tracking-widest text-secondary mb-1'>Estimated Value</span>
                      <span className='text-xl font-bold'>{game.price}</span>
                    </div>
                  )}
                </div>
                <div className='rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] text-secondary uppercase tracking-widest font-bold'>
                  Live Data
                </div>
              </div>
              
              <button className='w-full group relative overflow-hidden rounded-2xl bg-white px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:scale-[1.02] active:scale-[0.98]'>
                <span className='relative z-10 flex items-center justify-center gap-2'>
                  <Play className='h-4 w-4 fill-current' /> Launch Interface
                </span>
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000' />
              </button>
              
              <button className='mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white/10'>
                {game.website?.includes('/') ? `Visit ${game.website.split(' / ')[0]}` : 'Acquire Assets'}
              </button>
            </div>

            <div className='glass panel-glow rounded-[2rem] p-6'>
              <div className='hud-label mb-4'>System Info</div>
              <div className='space-y-4'>
                <div className='flex items-start justify-between text-xs gap-4'>
                  <span className='text-secondary uppercase tracking-widest shrink-0'>Platforms</span>
                  <span className='text-white text-right leading-5'>{game.platforms?.join(', ')}</span>
                </div>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-secondary uppercase tracking-widest'>Source</span>
                  <span className='text-white flex items-center gap-2'><Gamepad2 className='h-3 w-3' /> {game.website || 'Global Store'}</span>
                </div>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-secondary uppercase tracking-widest'>File Vector</span>
                  <span className='text-white font-mono'>{game.approxSize || 'Unknown size'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
      <StatusBar />
    </main>
  );
}
