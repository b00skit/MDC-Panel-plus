
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
          'relative flex h-10 w-full items-center rounded-full p-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          checked ? 'bg-green-500' : 'bg-destructive',
          className
        )}
      >
        <motion.div
          className="absolute z-10 h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center"
          layout
          transition={spring}
          style={{
            left: checked ? 'calc(100% - 2.25rem)' : '0.25rem',
          }}
        >
          {checked ? <Check className="h-5 w-5 text-green-500"/> : <X className="h-5 w-5 text-destructive" />}
        </motion.div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={checked ? textOn : textOff}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute w-full text-center text-sm font-medium text-white",
              checked ? 'left-[-1.5rem]' : 'right-[-1.5rem]'
            )}
          >
            {checked ? textOn : textOff}
          </motion.span>
        </AnimatePresence>
      </button>
    );
  }
);

BetterSwitch.displayName = 'BetterSwitch';

export { BetterSwitch };
