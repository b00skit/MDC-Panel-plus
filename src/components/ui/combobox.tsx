
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from './input';

interface ComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  onOpen?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
  className?: string;
  isInvalid?: boolean;
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
      className,
      isInvalid = false,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value || '');

    React.useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen && onOpen) {
            onOpen();
        }
    }

    const handleSelect = (currentValue: string) => {
      const selectedOption = options.find(opt => opt.toLowerCase() === currentValue.toLowerCase());
      const newValue = selectedOption || currentValue;
      onChange(newValue);
      setInputValue(newValue);
      setOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const currentInputValue = e.target.value;
        setInputValue(currentInputValue);
        onChange(currentInputValue);
    }
    
    const uniqueOptions = React.useMemo(() => [...new Set(options)], [options]);

    return (
      <div className={cn('relative', className)} ref={ref}>
         <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <div className="relative" >
                     <Input 
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={() => {
                            if (onOpen) onOpen();
                            setOpen(true);
                        }}
                        placeholder={placeholder}
                        className={cn('w-full pr-8', isInvalid && 'border-red-500 focus-visible:ring-red-500')}
                     />
                     <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 opacity-50 cursor-pointer" onClick={() => setOpen(o => !o)} />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                 <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
                        <CommandGroup>
                        {uniqueOptions.map((option) => (
                            <CommandItem
                            key={option}
                            value={option}
                            onSelect={() => handleSelect(option)}
                            >
                            <Check
                                className={cn(
                                'mr-2 h-4 w-4',
                                value === option ? 'opacity-100' : 'opacity-0'
                                )}
                            />
                            {option}
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    </CommandList>
                 </Command>
            </PopoverContent>
         </Popover>
      </div>
    );
  }
);
Combobox.displayName = 'Combobox';
