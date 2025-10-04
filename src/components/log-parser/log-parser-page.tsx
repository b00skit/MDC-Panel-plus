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
import { Alert } from '../ui/alert';
import { retriever } from 'genkit/plugin';

export function LogParserPage() {
  const [characterNames, setCharacterNames] = useState<string[]>(['']);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [options, setOptions] = useState({
    includeTimestamps: false,
    includeEmotes: true,
    includeRadio: false,
    includeAme: false,
    includeDo: false,
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

      const lowerLine = line.toLowerCase();
      const speechRegex = new RegExp(`(\\[\\d{2}:\\d{2}:\\d{2}\\]|^) ?${names.map(name => name.replace(/ /g, '[_ ]')).join('|')} says( |(phone|.*)|[.*]):`, 'i');
      const emoteRegex = new RegExp(`(\\[\\d{2}:\\d{2}:\\d{2}\\]|^) \\* (${names.map(name => name.replace(/ /g, '[_ ]')).join('|')})\\b`, 'i');
      const radioRegex = new RegExp(`(\\[\\d{2}:\\d{2}:\\d{2}\\]|^) \\*\\* \\[.*\\] ?(${names.map(name => name.replace(/ /g, '[_ ]')).join('|')})`, 'i');
      const doRegex = new RegExp(`\\(\\( ?(${names.map(name => name.replace(/ /g, '[_ ]')).join('|')}) ?\\)\\)\\*`, 'i');
      const ameRegex = new RegExp(`(\\[\\d{2}:\\d{2}:\\d{2}\\]|^) > (${names.map(name => name.replace(/ /g, '[_ ]')).join('|')})\\b`, 'i');

      const isSpeech = speechRegex.test(lowerLine);
      const isRadio = options.includeRadio && radioRegex.test(lowerLine);
      const isEmote = options.includeEmotes && emoteRegex.test(lowerLine);
      const isDo = options.includeDo && doRegex.test(lowerLine);
      const isAme = options.includeAme && ameRegex.test(lowerLine);

      return isSpeech || isRadio || isEmote || isDo || isAme;
    });

    if (!options.includeTimestamps) {
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
                    <div className="flex items-center space-x-2">
                        <Checkbox id="includeTimestamps" checked={options.includeTimestamps} onCheckedChange={() => handleOptionChange('includeTimestamps')} />
                        <Label htmlFor="includeTimestamps" className="text-sm font-normal cursor-pointer">Include Timestamps</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="includeEmotes" checked={options.includeEmotes} onCheckedChange={() => handleOptionChange('includeEmotes')} />
                        <Label htmlFor="includeEmotes" className="text-sm font-normal cursor-pointer">Include Emotes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="includeRadio" checked={options.includeRadio} onCheckedChange={() => handleOptionChange('includeRadio')} />
                        <Label htmlFor="includeRadio" className="text-sm font-normal cursor-pointer">Include Radio</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="includeAme" checked={options.includeAme} onCheckedChange={() => handleOptionChange('includeAme')} />
                        <Label htmlFor="includeAme" className="text-sm font-normal cursor-pointer">Include /ame</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="includeDo" checked={options.includeDo} onCheckedChange={() => handleOptionChange('includeDo')} />
                        <Label htmlFor="includeDo" className="text-sm font-normal cursor-pointer">Include /do</Label>
                    </div>
                </div>
            </div>
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
