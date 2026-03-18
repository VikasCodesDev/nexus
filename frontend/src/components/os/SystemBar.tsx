'use client';

import { Bell, Cpu, Library, Newspaper, Users2, BarChart3, Bot, SignalHigh, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUiStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { Magnetic } from '@/components/ui/Magnetic';

const navItems = [
  { label: 'Library', href: '/library', icon: Library },
  { label: 'News', href: '/news', icon: Newspaper },
  { label: 'Social', href: '/social', icon: Users2 },
  { label: 'Stats', href: '/stats', icon: BarChart3 },
  { label: 'AI', href: '/ai', icon: Bot },
];

export function SystemBar() {
  const { notifications } = useUiStore();
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className='fixed left-0 right-0 top-3 z-40 flex justify-center px-4'>
      <div className='glass panel-glow flex items-center gap-6 rounded-[1.4rem] px-6 py-2.5'>
        {/* Logo / Home */}
        <Magnetic strength={0.2}>
          <Link href='/' className='group flex items-center gap-3 transition-transform hover:scale-105'>
            <div className='flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.08] shadow-glow transition group-hover:border-white/30 group-hover:bg-white/20'>
              <Sparkles className='h-5 w-5 text-white' />
            </div>
            <div className='hidden xl:block'>
              <div className='font-heading text-base uppercase tracking-[0.35em] text-white'>NEXUS</div>
            </div>
          </Link>
        </Magnetic>

        {/* Divider */}
        <div className='h-6 w-px bg-white/10 hidden md:block' />

        {/* Center: Navigation Links */}
        <nav className='flex items-center gap-1.5 rounded-2xl bg-white/[0.03] p-1 border border-white/5'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Magnetic key={item.label} strength={0.3}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                    active 
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                    : 'text-secondary hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className='h-3.5 w-3.5' />
                  <span className='hidden lg:inline'>{item.label}</span>
                </Link>
              </Magnetic>
            );
          })}
          {mounted && (
            <div className='ml-2 hidden items-center gap-2 border-l border-white/10 pl-3 pr-2 text-[10px] font-mono text-secondary md:flex'>
              <SignalHigh className='h-3 w-3 text-emerald-400' />
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </nav>

        {/* Divider */}
        <div className='h-6 w-px bg-white/10 hidden md:block' />

        {/* Right Actions */}
        <div className='flex items-center gap-2'>
          <Magnetic strength={0.4}>
            <button className='relative rounded-xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10'>
              <Bell className='h-4 w-4' />
              {notifications > 0 && (
                <span className='absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-black'>
                  {notifications}
                </span>
              )}
            </button>
          </Magnetic>
          
          <Magnetic strength={0.2}>
            <Link href={user ? '/profile' : '/login'} className='flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1 transition hover:bg-white/10'>
              <img src={user?.avatar || 'https://api.dicebear.com/9.x/bottts/svg?seed=nexus'} alt='avatar' className='h-8 w-8 rounded-lg border border-white/10 bg-black/40' />
              <div className='hidden pr-2 text-left sm:block'>
                <div className='text-[10px] font-bold text-white leading-none uppercase'>{user?.username || 'GUEST'}</div>
              </div>
            </Link>
          </Magnetic>
        </div>
      </div>
    </header>
  );
}
