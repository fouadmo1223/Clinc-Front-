'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

const EASE = [0.32, 0.72, 0, 1] as const;

/** Wraps a trigger element; on hover, a floating avatar bubble appears and tracks the cursor. */
export function HoverPeek({
  children,
  avatar,
  className,
}: {
  children: React.ReactNode;
  avatar: React.ReactNode;
  className?: string;
}) {
  const [hovered, setHovered] = React.useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 20, stiffness: 300, mass: 0.5 });
  const springY = useSpring(y, { damping: 20, stiffness: 300, mass: 0.5 });

  const handleMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  return (
    <span
      className={`relative inline-block cursor-default ${className ?? ''}`}
      onMouseEnter={(e) => {
        handleMove(e);
        setHovered(true);
      }}
      onMouseMove={handleMove}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: EASE }}
            style={{ x: springX, y: springY, translateX: '-50%', translateY: 'calc(-100% - 14px)' }}
            className="pointer-events-none absolute start-0 top-0 z-50"
          >
            {avatar}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
