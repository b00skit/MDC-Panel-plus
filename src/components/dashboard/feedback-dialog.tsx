
'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import config from '../../../data/config.json';

const positiveReasons = [
    { id: 'design', label: 'The design is clean and intuitive.' },
    { id: 'performance', label: 'The application is fast and responsive.' },
    { id: 'feature', label: 'I really like a specific feature.' },
    { id: 'helpful', label: 'This tool is very helpful for my tasks.' },
];

const negativeReasons = [
    { id: 'bug', label: 'I encountered a technical bug or error.' },
    { id: 'slow', label: 'The application feels slow or laggy.' },
    { id: 'confusing', label: 'I find the layout or a feature confusing.' },
    { id: 'missing', label: 'A feature I need is missing.' },
];

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const pathname = usePathname();
  const [feedbackType, setFeedbackType] = React.useState<'positive' | 'negative' | null>(null);
  const [feedbackText, setFeedbackText] = React.useState('');
  const [selectedReasons, setSelectedReasons] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after dialog closes
    setTimeout(() => {
        setFeedbackType(null);
        setFeedbackText('');
        setSelectedReasons([]);
    }, 300);
  };

  const handleReasonChange = (reasonId: string) => {
    setSelectedReasons(prev => 
        prev.includes(reasonId) 
        ? prev.filter(r => r !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleSubmit = async () => {
    if (!feedbackType) {
        toast({ title: 'Please select a feedback type (thumbs up or down).', variant: 'destructive' });
        return;
    }
    
    setIsSubmitting(true);
    
    try {
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                isPositive: feedbackType === 'positive',
                feedback: feedbackText,
                reasons: selectedReasons,
                pathname: pathname,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to submit feedback.');
        }
        
        toast({ title: 'Thank you!', description: 'Your feedback has been submitted successfully.' });
        handleClose();

    } catch (error) {
        toast({ title: 'Error', description: 'Could not submit feedback. Please try again.', variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const reasons = feedbackType === 'positive' ? positiveReasons : negativeReasons;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Let me know what you think. Your feedback helps me improve.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex justify-center gap-4">
                <Button 
                    variant={feedbackType === 'positive' ? 'default' : 'outline'}
                    size="icon"
                    className={cn('h-16 w-16 rounded-full transition-all duration-200', feedbackType === 'positive' && 'scale-110 border-2 border-primary')}
                    onClick={() => setFeedbackType('positive')}
                >
                    <ThumbsUp className="h-8 w-8" />
                </Button>
                 <Button 
                    variant={feedbackType === 'negative' ? 'destructive' : 'outline'}
                    size="icon"
                    className={cn('h-16 w-16 rounded-full transition-all duration-200', feedbackType === 'negative' && 'scale-110 border-2 border-destructive')}
                    onClick={() => setFeedbackType('negative')}
                >
                    <ThumbsDown className="h-8 w-8" />
                </Button>
            </div>
          
           {feedbackType && (
             <div className="space-y-4 animate-in fade-in-50 duration-500">
                <div>
                    <Label>What's on your mind?</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {reasons.map(reason => (
                            <div key={reason.id} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`reason-${reason.id}`} 
                                    onCheckedChange={() => handleReasonChange(reason.label)} 
                                />
                                <Label htmlFor={`reason-${reason.id}`} className="text-sm font-normal cursor-pointer">{reason.label}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <Label htmlFor="feedback-text">
                        Do you have any additional thoughts? (Optional)
                    </Label>
                    <Textarea
                        id="feedback-text"
                        placeholder="Tell us more..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="mt-2"
                    />
                </div>
            </div>
           )}
        </div>
        <DialogFooter className="sm:justify-between">
             <Button asChild variant="outline" size="icon">
                <Link href={config.URL_DISCORD} target='_blank' aria-label="Join Discord">
                    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-5 w-5">
                        <title>Discord</title>
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4464.8245-.6667 1.284C13.5907 3.6448 12.825 3.5 12 3.5s-1.5907.1448-2.6852.6756c-.2203-.4595-.4557-.9087-.6667-1.284a.0741.0741 0 00-.0785-.0371A19.7913 19.7913 0 003.683 4.3698a.0741.0741 0 00-.0371.0785v11.2461c0 .0412.0224.0741.0628.0894A19.851 19.851 0 0012 19.5a19.851 19.851 0 008.2543-3.7161.0894.0894 0 00.0628-.0894V4.4483a.0741.0741 0 00-.0371-.0785zM8.0215 13.6264c-1.1211 0-2.0302-.909-2.0302-2.0302s.909-2.0302 2.0302-2.0302c1.1211 0 2.0302.909 2.0302 2.0302s-.909 2.0302-2.0302 2.0302zm7.957 0c-1.1211 0-2.0302-.909-2.0302-2.0302s.909-2.0302 2.0302-2.0302c1.1211 0 2.0302.909 2.0302 2.0302s-.909 2.0302-2.0302 2.0302z"/>
                    </svg>
                </Link>
            </Button>
            <div className="flex gap-2">
                <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!feedbackType || isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
