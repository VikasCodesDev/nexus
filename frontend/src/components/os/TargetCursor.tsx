'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function TargetCursor() {
  const [hovering, setHovering] = useState(false);
  const [locked, setLocked] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 15, stiffness: 800, mass: 0.01 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const interactiveSelector = 'button, a, [role="button"], input, select, textarea, label';

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement;
      setHovering(!!target.closest(interactiveSelector));
    };

    const onDown = (e: MouseEvent) => {
      setLocked(true);
      const id = Date.now();
      setRipples((current) => [...current, { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setRipples((current) => current.filter((ripple) => ripple.id !== id));
      }, 650);
    };

    const onUp = () => setLocked(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      <motion.div
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
        className={`nexus-cursor pointer-events-none fixed z-[999] rounded-full border transition-all duration-150 ${
          hovering ? 'h-10 w-10 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'h-8 w-8 border-white/60'
        } ${locked ? 'scale-90 bg-white/20' : 'scale-100'}`}
      >
        <div className='absolute inset-0 rounded-full bg-white/[0.05] blur-xl' />
        {/* Inner indicators */}
        <div className={`absolute rounded-full border border-white/30 transition-all duration-300 ${hovering ? 'inset-[2px]' : 'inset-[6px]'}`} />
        <div className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 transition-colors duration-300 ${hovering ? 'bg-white/80' : 'bg-white/40'}`} />
        <div className={`absolute left-0 top-1/2 h-px w-full -translate-y-1/2 transition-colors duration-300 ${hovering ? 'bg-white/80' : 'bg-white/40'}`} />
        
        {/* Hover lock-on effect */}
        {hovering && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            className='absolute inset-[-4px] rounded-full border border-white/40'
          />
        )}
      </motion.div>

      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          style={{ left: ripple.x, top: ripple.y, animation: 'targetLock 650ms ease-out forwards' }}
          className='pointer-events-none fixed z-[998] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70'
        />
      ))}
    </>
  );
}
