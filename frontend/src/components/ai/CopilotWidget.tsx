'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Bot } from 'lucide-react';

export function CopilotWidget() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    { role: 'ai', text: 'Copilot online. Ask for tactics, loadouts, or navigation.' }
  ]);

  const send = async () => {
    if (!user || !input.trim()) return;
    const userText = input;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/copilot', { message: userText, context: 'NEXUS dashboard' });
      setMessages((m) => [...m, { role: 'ai', text: res.data.reply }]);
    } catch (error) {
      setMessages((m) => [...m, { role: 'ai', text: getApiErrorMessage(error, 'Copilot is temporarily unavailable.') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div drag dragMomentum={false} className='fixed bottom-28 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)]'>
      <button onClick={() => setOpen((o) => !o)} className='glass panel-glow mb-2 flex w-full items-center justify-between rounded-[1.4rem] px-4 py-3 text-left'>
        <span className='font-heading text-sm uppercase tracking-[0.28em] text-white'>NEXUS Copilot</span>
        <Bot className='h-4 w-4 text-white' />
      </button>

      {open && (
        <div className='glass panel-glow rounded-[1.4rem] p-3'>
          {!user && <div className='mb-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-secondary'>Login to use Copilot.</div>}
          <div className='no-scrollbar mb-2 max-h-56 space-y-2 overflow-y-auto'>
            {messages.map((m, i) => (
              <div key={i} className={`rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-white/20 text-white' : 'bg-white/10 text-secondary'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className='flex gap-2'>
            <input value={input} onChange={(e) => setInput(e.target.value)} className='w-full rounded-2xl border border-white/20 bg-black/60 px-3 py-2 text-sm' placeholder='Ask Copilot' disabled={!user || loading} />
            <button onClick={() => send().catch(() => undefined)} className='rounded-2xl border border-white/20 px-3 text-sm text-white' disabled={!user || loading}>
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
