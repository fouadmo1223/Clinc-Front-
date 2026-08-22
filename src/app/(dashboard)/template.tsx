'use client';

import { motion } from 'framer-motion';

/**
 * Scoped to the (dashboard) route group only, so the sidebar/topbar in
 * layout.tsx stay mounted across navigation — only this content transitions.
 */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
