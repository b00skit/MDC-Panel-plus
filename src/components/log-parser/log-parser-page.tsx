
'use client';

import { useState, useRef } from 'react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Copy, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle } from '../ui/alert';

export function LogParserPage() {
  const [characterNames, setCharacterNames] = useState<string[]>(['']);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [options, setOptions] = useState({
    removeTimestamps: true,
    removeEmotes: false,
    removeRadio: true,
    removeAme: true,
    removeDo: true,
  });
  const outputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleAddCharacter = () => {
    setCharacterNames([...characterNames, '']);
  };

  const handleRemoveCharacter = (index: number) => {
    const newNames = [...characterNames];
    newNames.splice(index, 1);
    setCharacterNames(newNames);
  };

  const handleCharacterNameChange = (index: number, value: string) => {
    const newNames = [...characterNames];
    newNames[index] = value;
    setCharacterNames(newNames);
  };

  const handleOptionChange = (option: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const parseText = () => {
    const names = characterNames.map(name => name.trim().toLowerCase()).filter(Boolean);

    if (names.length === 0) {
        toast({
            title: 'Missing Character Name',
            description: 'Please enter at least one character name to filter the logs.',
            variant: 'destructive',
        });
        return;
    }

    const lines = inputText.split(/\r?\n/);
    let filtered = lines.filter(line => {
      if (options.removeRadio && line.includes('CH:')) return false;
      if (options.removeAme && line.trim().startsWith('>')) return false;
      if (options.removeDo && /\(\(.*\)\)\*/.test(line)) return false;

      return names.some(name => {
        const lowerLine = line.toLowerCase();
        const speechRegex = new RegExp(`\\] ?${name.replace(/ /g, '[_ ]')} says:`, 'i');
        const emoteRegex = new RegExp(`^\\* ?${name.replace(/ /g, '[_ ]')}\\b`, 'i');
        const doRegex = new RegExp(`\\(\\( ?${name.replace(/ /g, '[_ ]')} ?\\)\\)\\*`, 'i');

        if (options.removeEmotes) {
          return speechRegex.test(lowerLine) || doRegex.test(lowerLine);
        }
        return speechRegex.test(lowerLine) || emoteRegex.test(lowerLine) || doRegex.test(lowerLine);
      });
    });

    if (options.removeTimestamps) {
      filtered = filtered.map(line => line.replace(/^\[\d{2}:\d{2}:\d{2}\]\s?/, ''));
    }

    setOutputText(filtered.join('\n'));
    toast({
        title: 'Logs Parsed',
        description: 'The chat log has been filtered based on your selections.',
    });
  };

  const copyOutput = () => {
    if (!outputText) {
        toast({ title: 'Nothing to Copy', description: 'The output is empty.', variant: 'destructive' });
        return;
    }
    navigator.clipboard.writeText(outputText);
    toast({ title: 'Copied!', description: 'The filtered output has been copied to your clipboard.' });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Log Parser"
        description="Filter GTA:World chat logs to isolate specific character interactions."
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
                Enter the character names and select the filtering options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <Label>Character Names</Label>
                <div className="space-y-2">
                {characterNames.map((name, index) => (
                    <div key={index} className="flex items-center gap-2">
                    <Input
                        type="text"
                        placeholder={`Character Name ${index + 1}`}
                        value={name}
                        onChange={(e) => handleCharacterNameChange(index, e.target.value)}
                    />
                    {characterNames.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveCharacter(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    )}
                    </div>
                ))}
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={handleAddCharacter}>
                    <Plus className="mr-2 h-4 w-4" /> Add Character
                </Button>
            </div>

            <div>
                <Label>Filtering Options</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-2">
                    {Object.entries(options).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                            <Checkbox id={key} checked={value} onCheckedChange={() => handleOptionChange(key as keyof typeof options)} />
                            <Label htmlFor={key} className="text-sm font-normal cursor-pointer">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
             <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Note on Names with Spaces</AlertTitle>
                <CardDescription>
                    The parser automatically handles names with spaces (e.g., "John Doe") by treating the space as potentially being an underscore in the logs.
                </CardDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Input & Output</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <Label htmlFor="input-text">Raw Chat Log</Label>
                    <Textarea
                        id="input-text"
                        placeholder="Paste your chat log here..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="h-48 font-mono text-xs"
                    />
                </div>
                 <div>
                    <Label htmlFor="output-text">Filtered Output</Label>
                    <Textarea
                        id="output-text"
                        ref={outputRef}
                        readOnly
                        value={outputText}
                        placeholder="Filtered logs will appear here..."
                        className="h-48 font-mono text-xs"
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={parseText}>Parse Logs</Button>
                    <Button variant="secondary" onClick={copyOutput}>
                        <Copy className="mr-2 h-4 w-4" /> Copy Output
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
