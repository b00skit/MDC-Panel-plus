'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from './scroll-area';

interface ComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  onOpen?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
  loadingPlaceholder?: string;
  className?: string;
  isInvalid?: boolean;
  isLoading?: boolean;
}

export const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      options,
      value,
      onChange,
      onOpen,
      placeholder = 'Select an option',
      searchPlaceholder = 'Search...',
      emptyPlaceholder = 'No option found.',
      loadingPlaceholder = 'Loading...',
      className,
      isInvalid = false,
      isLoading = false,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value || '');
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const [searchValue, setSearchValue] = React.useState('');

    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      setInputValue(value || '');
    }, [value]);
    
    React.useEffect(() => {
        if (open && activeIndex !== -1 && listRef.current) {
            const item = listRef.current.children[activeIndex] as HTMLElement;
            if (item) {
                item.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [activeIndex, open]);

    const handleOpenChange = (isOpen: boolean) => {
      if (isLoading && !isOpen) return;

      setOpen(isOpen);
      if (!isOpen) {
        if (inputValue !== value) {
          onChange(inputValue);
        }
        setActiveIndex(-1);
        setSearchValue('');
      } else if (isOpen && onOpen) {
        onOpen();
      }
    };

    const handleSelect = (option: string) => {
      onChange(option);
      setInputValue(option);
      setOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      setSearchValue(e.target.value);
      if (!open) {
        setOpen(true);
      }
      setActiveIndex(-1);
    };

    const filteredOptions = React.useMemo(() => {
      if (!searchValue) return options;
      return options.filter(option =>
        String(option).toLowerCase().includes(String(searchValue).toLowerCase())
      );
    }, [searchValue, options]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isLoading) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!open) setOpen(true);
          setActiveIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!open) setOpen(true);
          setActiveIndex(prev =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex !== -1) {
            handleSelect(filteredOptions[activeIndex]);
          } else {
            onChange(inputValue);
            setOpen(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          break;
      }
    };
    
    // ✅ This new handler provides more robust scroll-locking logic.
    const handleWheelScroll = (e: React.WheelEvent) => {
      const el = e.currentTarget as HTMLElement;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const deltaY = e.deltaY;

      // If the dropdown isn't scrollable, don't interfere.
      if (scrollHeight <= clientHeight) {
        return;
      }
      
      // If scrolling up and we're at the top, allow the page to scroll.
      if (scrollTop === 0 && deltaY < 0) {
        return;
      }

      // If scrolling down and we're at the bottom, allow the page to scroll.
      // A 1px buffer is used to account for potential floating-point inaccuracies.
      if (scrollHeight - clientHeight - scrollTop <= 1 && deltaY > 0) {
        return;
      }

      // Otherwise, the user is scrolling within the dropdown, so we prevent the page from scrolling.
      e.preventDefault();
    };

    return (
      <div className={cn('relative', className)} ref={ref}>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={cn(
                  'w-full pr-8',
                  isInvalid && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 opacity-50 cursor-pointer" />
            </div>
          </PopoverTrigger>
          <PopoverContent
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="w-[--radix-popover-trigger-width] p-0"
            align="start"
          >
            {isLoading ? (
              <div className="py-6 text-center text-sm flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingPlaceholder}
              </div>
            ) : (
              <ScrollArea 
                className="max-h-60"
                // ✅ Apply the more robust wheel handler here.
                onWheel={handleWheelScroll}
              >
                <div ref={listRef}>
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option, index) => (
                      <Button
                        key={option}
                        variant="ghost"
                        className={cn(
                          'w-full justify-start font-normal h-9',
                          index === activeIndex && 'bg-accent text-accent-foreground'
                        )}
                        onClick={() => handleSelect(option)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === option ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {option}
                      </Button>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm">{emptyPlaceholder}</div>
                  )}
                </div>
              </ScrollArea>
            )}
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);
Combobox.displayName = 'Combobox';