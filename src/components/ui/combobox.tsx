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

    // Sync inputValue with the external value prop when it changes
    React.useEffect(() => {
      setInputValue(value || '');
    }, [value]);

    const handleOpenChange = (isOpen: boolean) => {
      // Prevent closing the popover while data is loading
      if (!isOpen && isLoading) {
        return;
      }
      
      setOpen(isOpen);
      if (isOpen && onOpen) {
        onOpen();
      }
      // If closing, reset the input to the last committed value
      if (!isOpen) {
        setInputValue(value || '');
      }
    };

    const handleSelect = (option: string) => {
      onChange(option); // Only call onChange on final selection
      setInputValue(option);
      setOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };

    const filteredOptions = React.useMemo(() => {
      if (!inputValue) {
        return options;
      }
      return options.filter(option =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
    }, [inputValue, options]);

    const uniqueOptions = React.useMemo(() => [...new Set(filteredOptions)], [filteredOptions]);

    return (
      <div className={cn('relative', className)} ref={ref}>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                value={inputValue}
                onChange={handleInputChange}
                // onFocus handler removed to prevent conflict with onClick
                placeholder={placeholder}
                className={cn(
                  'w-full pr-8',
                  isInvalid && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              <ChevronsUpDown
                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 opacity-50 cursor-pointer"
                onClick={() => handleOpenChange(!open)}
              />
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
              <ScrollArea className="max-h-60">
                {uniqueOptions.length > 0 ? (
                  uniqueOptions.map((option) => (
                    <Button
                      key={option}
                      variant="ghost"
                      className="w-full justify-start font-normal h-9"
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
              </ScrollArea>
            )}
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);
Combobox.displayName = 'Combobox';