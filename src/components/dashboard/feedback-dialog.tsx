
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
                    <svg role="img" viewBox="0 -28.5 256 256" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-5 w-5">
                        <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"></path>
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
