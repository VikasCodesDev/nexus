'use client';

export function TypewriterHeading({ text, className = '' }: { text: string; className?: string }) {
  return (
    <h2 className={`typewriter font-heading uppercase tracking-[0.28em] ${className}`}>
      {text}
    </h2>
  );
}
