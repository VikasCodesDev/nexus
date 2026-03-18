'use client';

import { Game } from '@/lib/types';
import { TypewriterHeading } from './TypewriterHeading';
import { motion } from 'framer-motion';

import { useRouter } from 'next/navigation';

export function ContentRow({ title, games }: { title: string; games: Game[] }) {
  const router = useRouter();
  const items: Array<Game | null> = games.length ? games : Array.from({ length: 4 }, () => null);

  return (
    <div className='glass panel-glow mt-6 rounded-[1.8rem] p-5'>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <TypewriterHeading text={title} className='text-sm md:text-base' />
        <div className='hud-label'>Horizontal Feed</div>
      </div>

      <div className='no-scrollbar flex gap-4 overflow-x-auto pb-2 scroll-smooth'>
        {items.map((game, index) => (
          <motion.div
            key={game?.id || `${title}-${index}`}
            whileHover={{ scale: 1.04 }}
            onClick={() => game && router.push(`/game/${game.id}`)}
            className={`group min-w-[260px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-surface shadow-glow transition-all duration-300 ${game ? 'cursor-pointer' : ''}`}
          >
            {game ? (
              <>
                <div className='relative overflow-hidden'>
                  <img src={game.image} alt={game.title} className='h-40 w-full object-cover transition duration-300 group-hover:scale-110' />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent' />
                  <div className='absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs'>
                    <span className='rounded-full border border-white/[0.15] bg-black/[0.55] px-2.5 py-1 text-white'>{game.multiplayer ? 'Squad Ready' : 'Solo Run'}</span>
                    <span className='rounded-full bg-white px-2.5 py-1 font-semibold text-black'>{game.rating}</span>
                  </div>
                </div>
                <div className='space-y-2 p-4'>
                  <div className='font-medium text-white'>{game.title}</div>
                  <div className='text-xs uppercase tracking-[0.22em] text-secondary'>{game.genre.join(' / ')}</div>
                  <div className='line-clamp-2 text-sm text-secondary'>{game.description}</div>
                </div>
              </>
            ) : (
              <div className='flex h-full min-h-[260px] flex-col gap-3 p-4'>
                <div className='h-40 rounded-[1.2rem] bg-white/[0.08]' />
                <div className='h-5 w-4/5 rounded-full bg-white/10' />
                <div className='h-4 w-1/2 rounded-full bg-white/[0.08]' />
                <div className='h-4 w-full rounded-full bg-white/[0.08]' />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
