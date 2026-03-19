'use client';

import { useEffect, useState } from 'react';
import { Github, Instagram, Twitter, Linkedin } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { Magnetic } from '@/components/ui/Magnetic';

const socialLinks = [
  { label: 'GitHub', icon: Github, href: 'https://github.com/VikasCodesDev' },
  { label: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/vikas01_____?igsh=MW1xNTI2bDBndHBtNQ==' },
  { label: 'X', icon: Twitter, href: 'https://x.com/MishraVika46260' },
  { label: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/vikas-mishra0106' },
];

export function Footer() {
  const [server, setServer] = useState('Checking');
  const [ping, setPing] = useState<number>(0);
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const { soundEnabled } = useUiStore();

  useEffect(() => {
    setMounted(true);
    const checkHealth = async () => {
      const start = performance.now();
      try {
        await api.get('/health');
        setServer('Online');
      } catch {
        setServer('Offline');
      }
      setPing(Math.round(performance.now() - start));
    };

    checkHealth().catch(() => undefined);

    const timer = setInterval(() => setTime(new Date()), 1000);
    const healthTimer = setInterval(() => {
      checkHealth().catch(() => undefined);
    }, 6000);

    return () => {
      clearInterval(timer);
      clearInterval(healthTimer);
    };
  }, []);

  return (
    <footer className="glass panel-glow mx-auto mt-12 max-w-[1440px] rounded-[1.8rem]">
      {/* Main footer row */}
      <div className="flex items-center justify-between px-8 py-3.5">
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          <div className="font-heading text-xs uppercase tracking-[0.28em] text-white">NEXUS</div>
          <div className="h-3 w-px bg-white/20" />
          <div className="text-[10px] text-secondary">Gaming Operating System</div>
        </div>

        {/* Center: Social Links */}
        <div className="flex items-center gap-1.5">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Magnetic key={link.label} strength={0.5}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-secondary transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                  aria-label={link.label}
                >
                  <Icon className="h-3 w-3" />
                </a>
              </Magnetic>
            );
          })}
        </div>

        {/* Right: Made by */}
        <div className="flex items-center gap-1 text-[10px] text-secondary">
          Crafted by <span className="animate-pulse text-[12px] drop-shadow-[0_0_8px_rgba(255,20,147,0.8)]">💖</span> <span className="font-medium text-white">Vikas</span>
        </div>
      </div>

      {/* Status bar row (moved from StatusBar component) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-8 py-2 text-[10px] text-secondary">
        <div className="font-medium text-white">NEXUS OS v1.0</div>
        <div>Server: {server}</div>
        <div>Ping: {ping}ms</div>
        <div>Audio: {soundEnabled ? 'Active' : 'Muted'}</div>
        <div>Pilot: {user?.username || 'Guest'}</div>
        <div>{mounted && time.toLocaleTimeString()}</div>
      </div>
    </footer>
  );
}