'use client';

import { useEffect, useState } from 'react';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { AiRecommendation } from '@/lib/types';
import { MagneticButton } from '@/components/os/MagneticButton';
import { Bot, Sparkles } from 'lucide-react';

const moodPresets = ['Ranked sprint', 'Co-op night', 'Narrative chill', 'Open world escape'];

export function AICommandPanel() {
  const { user } = useAuthStore();
  const [mood, setMood] = useState('competitive and fast-paced');
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRecommendations = async (nextMood = mood) => {
    if (!user) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/recommend', {
        mood: nextMood,
        preferences: ['action', 'multiplayer', 'story-rich']
      });
      setRecommendations(res.data.recommendations || []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Recommendation matrix unavailable.'));
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setRecommendations([]);
      return;
    }

    fetchRecommendations().catch(() => undefined);
  }, [user]);

  return (
    <div id='ai' className='glass panel-glow rounded-[1.8rem] p-5'>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <div>
          <div className='hud-label mb-2'>AI Panel</div>
          <div className='font-heading text-lg uppercase tracking-[0.24em] text-white'>Adaptive Recommendations</div>
        </div>
        <div className='flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5'>
          <Bot className='h-5 w-5 text-white' />
        </div>
      </div>

      {!user && <div className='mb-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-secondary'>Login to unlock AI recommendations and persistent copilot memory.</div>}

      <div className='mb-4 flex flex-wrap gap-2'>
        {moodPresets.map((preset) => (
          <button
            key={preset}
            onClick={() => {
              setMood(preset);
              fetchRecommendations(preset).catch(() => undefined);
            }}
            className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.22em] transition ${mood === preset ? 'border-white/[0.30] bg-white/[0.12] text-white' : 'border-white/10 bg-white/5 text-secondary hover:bg-white/10'}`}
            disabled={!user || loading}
          >
            {preset}
          </button>
        ))}
      </div>

      <input
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        className='mb-3 w-full rounded-2xl border border-white/[0.15] bg-black/50 px-4 py-3 text-sm outline-none transition focus:border-white/[0.30]'
        placeholder='Describe your mood'
        disabled={!user || loading}
      />

      <div className='mb-4 flex items-center justify-between gap-3'>
        <div className='text-xs uppercase tracking-[0.22em] text-secondary'>Prompt ready for live copilot sync</div>
        <MagneticButton onClick={() => fetchRecommendations().catch(() => undefined)} disabled={!user || loading}>
          <span className='flex items-center gap-2'>
            <Sparkles className='h-4 w-4' />
            {loading ? 'Generating...' : 'Generate'}
          </span>
        </MagneticButton>
      </div>

      {error && <div className='mb-3 rounded-2xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200'>{error}</div>}

      <div className='space-y-3'>
        {loading && !recommendations.length && (
          <div className='grid gap-3'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className='flex items-center gap-3 rounded-2xl border border-white/10 bg-black/[0.35] p-3'>
                <div className='h-14 w-14 rounded-xl bg-white/[0.08]' />
                <div className='flex-1 space-y-2'>
                  <div className='h-4 w-1/2 rounded-full bg-white/10' />
                  <div className='h-3 w-full rounded-full bg-white/[0.08]' />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !recommendations.length && (
          <div className='rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-secondary'>
            AI picks will appear here once the recommendation engine finishes scoring your mood profile.
          </div>
        )}

        {recommendations.map((item) => (
          <div key={item.title} className='flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 p-3 transition hover:bg-white/[0.06]'>
            <img src={item.image} alt={item.title} className='h-14 w-14 rounded-xl object-cover' />
            <div className='min-w-0'>
              <div className='truncate text-sm font-semibold text-white'>{item.title}</div>
              <div className='mt-1 text-xs leading-5 text-secondary'>{item.reason}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
