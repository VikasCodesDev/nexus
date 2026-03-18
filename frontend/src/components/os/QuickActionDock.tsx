'use client';

import { Library, Newspaper, Users2, BarChart3, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Magnetic } from '@/components/ui/Magnetic';

const dockItems = [
  { id: 'library', label: 'Library', href: '/library', icon: Library },
  { id: 'news', label: 'News', href: '/news', icon: Newspaper },
  { id: 'social', label: 'Social', href: '/social', icon: Users2 },
  { id: 'stats', label: 'Stats', href: '/stats', icon: BarChart3 },
  { id: 'ai', label: 'AI', href: '/ai', icon: Bot },
];

export function QuickActionDock() {
  const pathname = usePathname();

  return (
    <div className='glass panel-glow fixed bottom-16 left-1/2 z-40 flex -translate-x-1/2 gap-2 rounded-[1.4rem] px-3 py-2 backdrop-blur-xl'>
      {dockItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Magnetic key={item.id} strength={0.4}>
            <Link href={item.href}>
              <motion.div
                whileHover={{ y: -6, scale: 1.05 }}
                className={`group relative flex min-w-[72px] flex-col items-center gap-1 rounded-2xl border px-3 py-2 shadow-glow transition ${active ? 'border-white/[0.30] bg-white/[0.14] text-white' : 'border-white/[0.15] bg-white/[0.06] text-secondary hover:text-white'}`}
              >
                <Icon className='h-5 w-5' />
                <span className='text-[10px] uppercase tracking-[0.22em]'>{item.label}</span>
              </motion.div>
            </Link>
          </Magnetic>
        );
      })}
    </div>
  );
}
