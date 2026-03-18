'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { SystemBar } from '@/components/os/SystemBar';
import { StatusBar } from '@/components/os/StatusBar';
import { TargetCursor } from '@/components/os/TargetCursor';
import { AICommandPanel } from '@/components/ai/AICommandPanel';
import { CopilotWidget } from '@/components/ai/CopilotWidget';
import { Footer } from '@/components/os/Footer';

export default function AiPage() {
  const { fetchMe } = useAuthStore();
  const { setModule } = useUiStore();

  useEffect(() => { setModule('AI Nexus', 'Dashboard / AI'); }, [setModule]);
  useEffect(() => { fetchMe().catch(() => undefined); }, [fetchMe]);

  return (
    <main className='min-h-screen px-4 pb-32'>
      <TargetCursor />
      <SystemBar />
      <CopilotWidget />

      <div className='mx-auto max-w-[1440px] pt-24'>
        <div className='mb-6'>
          <div className='hud-label mb-2'>AI Module</div>
          <h1 className='typewriter font-heading text-3xl uppercase tracking-[0.24em] text-white'>AI Nexus</h1>
          <p className='mt-2 text-sm leading-6 text-secondary'>Get AI-powered game recommendations based on your mood.</p>
        </div>

        <div className='grid gap-6 xl:grid-cols-2'>
          <AICommandPanel />
          <div className='glass panel-glow rounded-[1.8rem] p-5'>
            <div className='hud-label mb-2'>Copilot Guide</div>
            <div className='font-heading text-lg uppercase tracking-[0.24em] text-white mb-4'>How to Use</div>
            <div className='space-y-3 text-sm text-secondary leading-6'>
              <div className='rounded-2xl border border-white/10 bg-black/[0.35] p-4'>
                <div className='text-white font-medium mb-1'>1. Set Your Mood</div>
                Use the preset buttons or type a custom mood to tell the AI what kind of gaming experience you want.
              </div>
              <div className='rounded-2xl border border-white/10 bg-black/[0.35] p-4'>
                <div className='text-white font-medium mb-1'>2. Generate Picks</div>
                Hit Generate and the AI will analyze your mood against the curated game catalog.
              </div>
              <div className='rounded-2xl border border-white/10 bg-black/[0.35] p-4'>
                <div className='text-white font-medium mb-1'>3. Use Copilot</div>
                Open the draggable Copilot widget (bottom right) for real-time gaming advice and system navigation.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <StatusBar />
    </main>
  );
}
