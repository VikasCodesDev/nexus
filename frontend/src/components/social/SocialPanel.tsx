'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSocialStore } from '@/store/social';
import { ActivityItem, SocialFriend } from '@/lib/types';
import { Users2 } from 'lucide-react';

export function SocialPanel({ friends, activity, loading = false }: { friends: SocialFriend[]; activity: ActivityItem[]; loading?: boolean }) {
  const { onlineUsers, messages, sendMessage } = useSocialStore();
  const [selected, setSelected] = useState<string | null>(friends[0]?.id || null);
  const [text, setText] = useState('');

  const thread = useMemo(() => messages.filter((m) => m.to === selected || m.from === selected), [messages, selected]);
  const activeFriend = friends.find((friend) => friend.id === selected) || friends[0] || null;

  useEffect(() => {
    if (!friends.length) {
      setSelected(null);
      return;
    }

    if (!selected || !friends.some((friend) => friend.id === selected)) {
      setSelected(friends[0].id);
    }
  }, [friends, selected]);

  return (
    <div id='social' className='glass panel-glow rounded-[1.8rem] p-5'>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <div>
          <div className='hud-label mb-2'>Social Panel</div>
          <div className='font-heading text-lg uppercase tracking-[0.24em] text-white'>Squad Link</div>
        </div>
        <div className='flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5'>
          <Users2 className='h-5 w-5 text-white' />
        </div>
      </div>

      <div className='grid gap-4 xl:grid-cols-[1.05fr_0.95fr]'>
        <div>
          <div className='mb-3 flex items-center justify-between'>
            <div className='text-xs uppercase tracking-[0.22em] text-secondary'>Friends Online</div>
            <div className='text-xs text-secondary'>{friends.filter((friend) => onlineUsers[friend.id] ?? friend.online).length} active</div>
          </div>

          <div className='no-scrollbar mb-4 flex gap-3 overflow-x-auto pb-1'>
            {friends.length === 0 ? (
              <div className='flex h-[68px] w-full items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] px-6 text-sm text-secondary italic'>
                No active squad members in range
              </div>
            ) : (
              friends.map((friend) => {
                const isOnline = onlineUsers[friend.id] ?? friend.online;
                return (
                  <button
                    key={friend.id}
                    onClick={() => setSelected(friend.id)}
                    className={`group flex min-w-[200px] items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 ${
                      selected === friend.id 
                        ? 'border-white/20 bg-white/[0.08] shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                        : 'border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className='relative'>
                      <img 
                        src={friend.avatar} 
                        alt={friend.username} 
                        className={`h-10 w-10 rounded-full border transition-all duration-500 ${
                          isOnline ? 'border-green-500/50 scale-105' : 'border-white/10 grayscale-[0.5]'
                        }`} 
                      />
                      {isOnline && (
                        <span className='absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black'>
                          <span className='h-2 w-2 animate-pulse rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' />
                        </span>
                      )}
                    </div>
                    <div className='min-w-0 flex-1 uppercase tracking-wider'>
                      <div className='truncate text-[13px] font-medium text-white'>{friend.username}</div>
                      <div className={`text-[10px] font-bold ${isOnline ? 'text-green-400' : 'text-zinc-500'}`}>
                        {isOnline ? 'SYSTEM ACTIVE' : 'SIGNAL LOST'}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className='mb-3 rounded-[1.5rem] border border-white/10 bg-black/[0.32] p-4'>
            <div className='mb-2 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-secondary'>
              <span>Party Chat</span>
              <span>{activeFriend?.username || 'No target'}</span>
            </div>

            <div className='no-scrollbar mb-3 max-h-44 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-black/[0.35] p-3'>
              {!thread.length && (
                <div className='text-sm text-secondary'>
                  Lock onto a squadmate to send a ping, ready check, or match invite.
                </div>
              )}
              {thread.map((message) => (
                <div key={message.id} className='rounded-2xl bg-white/[0.06] px-3 py-2 text-sm'>
                  <span className='mr-2 text-xs uppercase tracking-[0.18em] text-secondary'>
                    {message.from === selected ? activeFriend?.username || 'Friend' : 'You'}
                  </span>
                  <span className='text-white'>{message.content}</span>
                </div>
              ))}
            </div>

            <div className='flex gap-2'>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className='w-full rounded-2xl border border-white/20 bg-black/60 px-3 py-2 text-sm'
                placeholder='Send ready check or squad ping'
                disabled={!selected}
              />
              <button
                onClick={() => {
                  if (!selected || !text.trim()) return;
                  sendMessage(selected, text);
                  setText('');
                }}
                className='rounded-2xl border border-white/20 px-4 text-sm text-white transition hover:bg-white/10 disabled:opacity-50'
                disabled={!selected || !text.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className='mb-3 flex items-center justify-between'>
            <div className='text-xs uppercase tracking-[0.22em] text-secondary'>Activity Feed</div>
            <div className='text-xs text-secondary'>{loading ? 'Syncing...' : 'Live'}</div>
          </div>

          <div className='no-scrollbar max-h-[360px] space-y-3 overflow-y-auto'>
            {loading && !activity.length && (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className='rounded-2xl border border-white/10 bg-black/[0.35] p-4'>
                  <div className='h-4 w-2/3 rounded-full bg-white/10' />
                  <div className='mt-3 h-3 w-full rounded-full bg-white/[0.08]' />
                </div>
              ))
            )}

            {!loading && !activity.length && (
              <div className='rounded-2xl border border-white/10 bg-black/[0.35] p-4 text-sm text-secondary'>
                Activity telemetry will stream here once you and your squad start moving through NEXUS.
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
    </div>
  );
}
