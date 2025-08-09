
'use client';

import { Controller, Control, FieldValues, Path, UseFormRegister, FieldArrayWithId } from 'react-hook-form';
import { TableRow, TableHead, TableCell, TableBody } from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Trash2, CirclePlus } from 'lucide-react';
import { FormState } from '@/stores/advanced-report-store';

interface NarrativeSectionProps {
    title: string;
    children: React.ReactNode;
}

export const NarrativeSection = ({ title, children }: NarrativeSectionProps) => {
    return (
      <>
        <TableRow className="h-3" />
        <TableRow>
          <TableHead className="bg-secondary gap-x-2" colSpan={5}>
            <div className="flex flex-wrap justify-center items-center relative">
              <a>{title}</a>
            </div>
          </TableHead>
        </TableRow>
        <TableRow>
            <TableCell colSpan={5} className="p-2 space-y-2">
                {children}
            </TableCell>
        </TableRow>
      </>
    );
};


interface EvidenceLogProps {
    control: Control<FormState>;
    register: UseFormRegister<FormState>;
    fields: FieldArrayWithId<FormState, "evidenceLogs", "id">[];
    onRemove: (index: number) => void;
    onAdd: () => void;
    onKeyUp: () => void;
  }
  
  export const EvidenceLog: React.FC<EvidenceLogProps> = ({ fields, register, onRemove, onAdd, onKeyUp }) => (
    <TableBody>
        <TableRow>
          <TableHead className="bg-secondary" colSpan={2}>EVIDENCE LOG NUMBER</TableHead>
          <TableHead className="bg-secondary" colSpan={2}>DESCRIPTION</TableHead>
          <TableHead className="bg-secondary" colSpan={1}>QUANTITY</TableHead>
        </TableRow>
        {fields.map((field, index) => (
          <TableRow key={field.id}>
            <TableCell colSpan={2}><Input placeholder="EL/2/LOGNO./YEAR" {...register(`evidenceLogs.${index}.logNumber`)} onKeyUp={onKeyUp} /></TableCell>
            <TableCell colSpan={2}><Input placeholder={`DESCRIPTION OF ITEM ${index + 1}`} {...register(`evidenceLogs.${index}.description`)} onKeyUp={onKeyUp} /></TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Input placeholder="QUANTITY" {...register(`evidenceLogs.${index}.quantity`)} onKeyUp={onKeyUp}/>
                <Button variant="ghost" size="icon" onClick={() => onRemove(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
            <TableCell colSpan={5} className="p-1">
                <Button className="w-full" type="button" onClick={onAdd}>
                    <CirclePlus className="mr-2 h-4 w-4" /> ADD EVIDENCE LOG
                </Button>
            </TableCell>
        </TableRow>
    </TableBody>
  );
  
