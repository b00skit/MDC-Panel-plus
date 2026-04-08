
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clipboard, Asterisk } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useScopedI18n } from '@/lib/i18n/client';

interface CopyableCardProps {
  label: string;
  value: string | number;
  tooltipContent?: string;
  colorClass?: string;
  className?: string;
}

export const CopyableCard = ({
  label,
  value,
  tooltipContent,
  colorClass,
  className,
}: CopyableCardProps) => {
  const { toast } = useToast();
  const t = useScopedI18n('arrestCalculation.results');

  const inputId = `copy-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(value.toString());
    toast({
      title: t('copyables.toastTitle'),
      description: t('copyables.toastDescription', { label }),
    });
  };

  const content = (
    <Card className={cn(colorClass, className)}>
      <CardContent className="p-4">
        <Label htmlFor={inputId}>
          <div className="flex items-center gap-1">
            {label}
            {tooltipContent && <Asterisk className="h-3 w-3 text-yellow-500" />}
          </div>
        </Label>
        <div className="flex items-center gap-2 mt-2">
          <Input 
            id={inputId} 
            value={value} 
            readOnly 
            disabled 
            className={cn(colorClass && "border-current", "bg-background/50")} 
          />
          <Button size="icon" variant="outline" onClick={handleCopy}>
            <Clipboard className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};
