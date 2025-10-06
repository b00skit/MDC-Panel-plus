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
import { boolean } from 'zod';

export function LogParserPage() {
  const [characterNames, setCharacterNames] = useState<string[]>(['']);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [options, setOptions] = useState({
    includeTimestamps: {isChecked: false, text: 'includeTimestamps'},
    includeEmotes: {isChecked: true, text: 'includeEmotes'},
    includeRadio: {isChecked: false, text: 'includeRadio'},
    includeAme: {isChecked: false, text: 'includeAme'},
    includeDo: {isChecked: true, text: 'includeDo'},
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
    setOptions(prev => ({ ...prev, [option]: {isChecked: !(prev[option].isChecked), text: prev[option].text}}));
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
      const isRadio = options.includeRadio.isChecked && radioRegex.test(lowerLine);
      const isEmote = options.includeEmotes.isChecked && emoteRegex.test(lowerLine);
      const isDo = options.includeDo.isChecked && doRegex.test(lowerLine);
      const isAme = options.includeAme.isChecked && ameRegex.test(lowerLine);

      return isSpeech || isRadio || isEmote || isDo || isAme;
    });

    if (!options.includeTimestamps.isChecked) {
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
                  {Object.entries(options).map((entry) => entry[1]).map( (value: {isChecked: any, text: any}) => (
                    <div key={value.text} className="flex items-center space-x-2">
                      <Checkbox id={value.text} checked={value.isChecked} onCheckedChange={() => handleOptionChange(value.text)}/>
                      <Label htmlFor={value.text} className='text-sm font-normal cursor pointer'>{value.text.replace(/([A-Z])/g, ' $1').replace(/^./, (str:any) => str.toUpperCase())}</Label>
                    </div>
                  ))}
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
