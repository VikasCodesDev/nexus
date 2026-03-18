'use client';

import { useEffect, useState } from 'react';
import { useUiStore } from '@/store/ui';
import { api } from '@/lib/api';
import { Game } from '@/lib/types';
import { SystemBar } from '@/components/os/SystemBar';
import { StatusBar } from '@/components/os/StatusBar';
import { TargetCursor } from '@/components/os/TargetCursor';
import { Search, Loader2 } from 'lucide-react';
import { ContentRow } from '@/components/os/ContentRow';
import { CopilotWidget } from '@/components/ai/CopilotWidget';
import { Footer } from '@/components/os/Footer';

type GameCollections = {
  trending: Game[];
  topRated: Game[];
  multiplayer: Game[];
  newReleases: Game[];
};

const emptyGames: GameCollections = { trending: [], topRated: [], multiplayer: [], newReleases: [] };

export default function LibraryPage() {
  const { setModule } = useUiStore();
  const [games, setGames] = useState<GameCollections>(emptyGames);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setModule('Library', 'Dashboard / Library');
  }, [setModule]);

  const fetchLibrary = (query = '') => {
    if (query) setIsSearching(true);
    api.get('/games', { params: { search: query } })
      .then((res) => {
        setGames({
          trending: res.data.trending || [],
          topRated: res.data.topRated || [],
          multiplayer: res.data.multiplayer || [],
          newReleases: res.data.newReleases || [],
        });
      })
      .catch(() => undefined)
      .finally(() => setIsSearching(false));
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery) {
      if (isSearching) fetchLibrary();
      return;
    }
    const timer = setTimeout(() => {
      fetchLibrary(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <main className='min-h-screen px-4 pb-32 font-sans'>
      <TargetCursor />
      <SystemBar />
      <CopilotWidget />

      <div className='mx-auto max-w-[1440px] pt-24'>
        <div className='glass panel-glow rounded-[2.5rem] p-10 mb-8 border border-white/10'>
          <div className='flex flex-col md:flex-row md:items-end justify-between gap-8'>
            <div className='max-w-2xl'>
              <div className='hud-label mb-3'>Library Module</div>
              <h1 className='font-heading text-4xl uppercase tracking-[0.24em] text-white'>Game Library</h1>
              <p className='mt-4 text-secondary leading-relaxed'>Browse the full curated catalog. Use the search vector below to pinpoint specific operational titles.</p>
            </div>

            <div className='relative w-full md:w-[400px] group'>
              <div className='absolute inset-y-0 left-5 flex items-center pointer-events-none'>
                {isSearching ? (
                  <Loader2 className='h-5 w-5 text-secondary animate-spin' />
                ) : (
                  <Search className='h-5 w-5 text-secondary group-focus-within:text-white transition-colors duration-300' />
                )}
              </div>
              <input
                type='text'
                placeholder='SEARCH OPERATIONAL DATABASE...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full bg-black/40 border border-white/15 rounded-2xl py-5 pl-14 pr-6 text-xs text-white uppercase tracking-[0.2em] focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all duration-300 placeholder:text-white/20'
              />
            </div>
          </div>
        </div>

        {searchQuery ? (
          <div className='space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500'>
            <ContentRow title={`Search Results: ${searchQuery}`} games={games.trending} />
          </div>
        ) : (
          <div className='space-y-12'>
            <ContentRow title='Trending Games' games={games.trending} />
            <ContentRow title='Top Rated' games={games.topRated} />
            <ContentRow title='Multiplayer' games={games.multiplayer} />
            <ContentRow title='New Releases' games={games.newReleases} />
          </div>
        )}
      </div>

      <Footer />
      <StatusBar />
    </main>
  );
}
