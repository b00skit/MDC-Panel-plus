
'use client';

import { Controller, Control, FieldValues, Path, UseFormRegister, FieldArrayWithId } from 'react-hook-form';
import { TableRow, TableHead, TableCell, TableBody } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Trash2, CirclePlus } from 'lucide-react';
import { FormState } from '@/stores/advanced-report-store';

interface NarrativeSectionProps<T extends FieldValues> {
    title: string;
    presetFieldName: Path<T>;
    control: Control<T>;
    children: React.ReactNode;
}

export const NarrativeSection = <T extends FieldValues>({ title, presetFieldName, control, children }: NarrativeSectionProps<T>) => {
    return (
      <>
        <TableRow className="h-3" />
        <TableRow>
          <TableHead className="bg-secondary gap-x-2" colSpan={5}>
            <div className="flex flex-wrap justify-center items-center relative">
              <a>{title}</a>
              <div className="flex items-center my-1 mr-2 absolute right-0">
                 <Controller
                    name={presetFieldName}
                    control={control}
                    render={({ field }) => (
                        <>
                            <Label htmlFor={presetFieldName} className="select-none text-sm font-medium mr-1 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Enable Preset?
                            </Label>
                            <Checkbox
                                id={presetFieldName}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </>
                    )}
                    />
              </div>
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
  }
  
  export const EvidenceLog: React.FC<EvidenceLogProps> = ({ fields, register, onRemove, onAdd }) => (
    <>
      <TableBody>
        <TableRow>
          <TableHead className="bg-secondary" colSpan={2}>EVIDENCE LOG NUMBER</TableHead>
          <TableHead className="bg-secondary" colSpan={2}>DESCRIPTION</TableHead>
          <TableHead className="bg-secondary" colSpan={1}>QUANTITY</TableHead>
        </TableRow>
        {fields.map((field, index) => (
          <TableRow key={field.id}>
            <TableCell colSpan={2}><Input placeholder="EL/2/LOGNO./YEAR" {...register(`evidenceLogs.${index}.logNumber`)} /></TableCell>
            <TableCell colSpan={2}><Input placeholder={`DESCRIPTION OF ITEM ${index + 1}`} {...register(`evidenceLogs.${index}.description`)} /></TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Input placeholder="QUANTITY" {...register(`evidenceLogs.${index}.quantity`)} />
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
    </>
  );
  
