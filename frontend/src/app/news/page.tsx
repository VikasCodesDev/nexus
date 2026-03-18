'use client';

import { useEffect, useState } from 'react';
import { useUiStore } from '@/store/ui';
import { api } from '@/lib/api';
import { NewsItem } from '@/lib/types';
import { SystemBar } from '@/components/os/SystemBar';
import { StatusBar } from '@/components/os/StatusBar';
import { TargetCursor } from '@/components/os/TargetCursor';
import { CopilotWidget } from '@/components/ai/CopilotWidget';
import { Footer } from '@/components/os/Footer';

export default function NewsPage() {
  const { setModule } = useUiStore();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setModule('News Pulse', 'Dashboard / News');
  }, [setModule]);

  useEffect(() => {
    let active = true;
    api.get('/news').then((res) => {
      if (!active) return;
      setNews(res.data.news || []);
    }).catch(() => undefined).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <main className='min-h-screen px-4 pb-32'>
      <TargetCursor />
      <SystemBar />
      <CopilotWidget />

      <div className='mx-auto max-w-[1440px] pt-24'>
        <div className='glass panel-glow rounded-[1.8rem] p-6 mb-6'>
          <div className='hud-label mb-2'>News Module</div>
          <h1 className='typewriter font-heading text-3xl uppercase tracking-[0.24em] text-white'>Live Briefings</h1>
          <p className='mt-3 text-sm leading-6 text-secondary'>Real-time gaming news feed powered by RSS. Click any card to read the full story.</p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
          {loading && !news.length && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='glass panel-glow rounded-[1.6rem] p-5 animate-pulse'>
              <div className='aspect-video w-full rounded-xl bg-white/5' />
              <div className='mt-4 h-3 w-1/4 rounded-full bg-white/10' />
              <div className='mt-3 h-5 w-full rounded-full bg-white/[0.08]' />
              <div className='mt-2 h-5 w-4/5 rounded-full bg-white/[0.08]' />
            </div>
          ))}

          {news.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target='_blank'
              rel='noreferrer'
              className='group glass panel-glow flex flex-col rounded-[1.6rem] overflow-hidden transition hover:bg-white/[0.04] border border-white/5'
            >
              {item.image && (
                <div className='relative aspect-video w-full overflow-hidden'>
                  <img src={item.image} alt='' className='h-full w-full object-cover transition duration-500 group-hover:scale-105' />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                </div>
              )}
              <div className='p-6'>
                <div className='mb-4 flex items-center justify-between'>
                  <span className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary'>{item.source || 'Intelligence'}</span>
                  <span className='text-[10px] text-white/40'>{new Date(item.pubDate).toLocaleDateString()}</span>
                </div>
                <div className='line-clamp-2 text-lg font-bold text-white leading-tight group-hover:text-white/90 transition-colors'>{item.title}</div>
                <div className='mt-4 line-clamp-3 text-sm leading-6 text-secondary/80'>{item.contentSnippet}</div>
                <div className='mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white opacity-0 group-hover:opacity-100 transition-opacity'>
                  Read Decrypted Intel →
                </div>
              </div>
            </a>
          ))}

          {!loading && !news.length && (
            <div className='glass panel-glow col-span-full rounded-[1.6rem] p-12 text-center'>
              <div className='hud-label mb-2'>Signal Lost</div>
              <p className='text-sm text-secondary'>No current news available in the restricted frequency. Check back later.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
      <StatusBar />
    </main>
  );
}
