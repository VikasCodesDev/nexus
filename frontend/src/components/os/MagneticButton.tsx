'use client';

import { HTMLMotionProps, motion, useMotionValue, useSpring } from 'framer-motion';
import { ReactNode } from 'react';

type MagneticButtonProps = HTMLMotionProps<'button'> & {
  children: ReactNode;
};

export function MagneticButton({ children, className = '', ...props }: MagneticButtonProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 15 });
  const sy = useSpring(y, { stiffness: 240, damping: 15 });

  return (
    <motion.button
      {...props}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) * 0.15);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.15);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x: sx, y: sy }}
      className={`group relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.08] px-4 py-2.5 text-sm text-white shadow-glow transition duration-300 hover:border-white/40 hover:bg-white/[0.14] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <span className='absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent opacity-0 transition duration-300 group-hover:opacity-100' />
      <span className='relative z-10'>{children}</span>
    </motion.button>
  );
}
