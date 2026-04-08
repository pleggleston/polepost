'use client';

import { motion, type PanInfo } from 'framer-motion';
import { useState } from 'react';

type SwipeResult = 'save' | 'dismiss' | null;

const SWIPE_THRESHOLD = 120;

export function PoleSwipeFlyer() {
  const [isVisible, setIsVisible] = useState(true);
  const [swipeResult, setSwipeResult] = useState<SwipeResult>(null);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x <= -SWIPE_THRESHOLD) {
      setSwipeResult('dismiss');
      setIsVisible(false);
      return;
    }

    if (info.offset.x >= SWIPE_THRESHOLD) {
      setSwipeResult('save');
      setIsVisible(false);
    }
  };

  if (!isVisible) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md border border-black/10 bg-white/60 px-4 text-center text-xs font-medium text-zinc-700 backdrop-blur-[1px]">
        {swipeResult === 'save' ? 'Saved for now (demo state).' : 'Dismissed for now (demo state).'}
      </div>
    );
  }

  return (
    <motion.article
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.25}
      onDragEnd={handleDragEnd}
      whileDrag={{ rotate: 4 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="h-full w-full touch-pan-y rounded-md border border-zinc-900/20 bg-gradient-to-b from-amber-50 to-stone-100 p-4 shadow-[0_16px_28px_rgba(0,0,0,0.32)]"
    >
      <div className="flex h-full flex-col rounded-sm border border-zinc-900/10 bg-white/90 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">PolePost Test Flyer</p>
        <h3 className="mt-2 text-xl font-bold leading-tight text-zinc-900">Sunset Block Party</h3>
        <p className="mt-2 text-sm text-zinc-700">Fri, April 24 • 7:00 PM</p>
        <p className="text-sm text-zinc-700">Warehouse District, Austin</p>
        <div className="mt-4 flex-1 rounded-sm border border-dashed border-zinc-300 bg-[repeating-linear-gradient(45deg,#f4f4f5,#f4f4f5_8px,#fafafa_8px,#fafafa_16px)]" />
        <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Swipe right to save • left to dismiss</p>
      </div>
    </motion.article>
  );
}
