
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BetterSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  textOn?: string;
  textOff?: string;
  className?: string;
}

const BetterSwitch = React.forwardRef<
  HTMLButtonElement,
  BetterSwitchProps
>(
  (
    {
      checked,
      onCheckedChange,
      textOn = 'On',
      textOff = 'Off',
      className,
    },
    ref
  ) => {
    const spring = {
      type: 'spring',
      stiffness: 700,
      damping: 30,
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative flex h-10 w-48 items-center rounded-full p-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          checked ? 'bg-green-500' : 'bg-destructive',
          className
        )}
      >
        <motion.div
          className="absolute z-10 h-8 w-8 rounded-full bg-white shadow-md"
          layout
          transition={spring}
          style={{
            left: checked ? '0.25rem' : 'calc(100% - 2.25rem)',
          }}
        />
        <div className="relative flex w-full items-center justify-center text-white">
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={checked ? 'on' : 'off'}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 text-sm font-medium"
            >
              {checked ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              {checked ? textOn : textOff}
            </motion.span>
          </AnimatePresence>
        </div>
      </button>
    );
  }
);

BetterSwitch.displayName = 'BetterSwitch';

export { BetterSwitch };
