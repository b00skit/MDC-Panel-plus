
'use client';

import { Controller, Control, FieldValues, Path, UseFormRegister, FieldArrayWithId } from 'react-hook-form';
import { TableRow, TableHead, TableCell, TableBody } from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Trash2, CirclePlus } from 'lucide-react';
import { FormState } from '@/stores/advanced-report-store';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useI18n } from '@/lib/i18n/client';


interface NarrativeSectionProps {
    title: string;
    children: React.ReactNode;
    presetName: keyof FormState['presets'];
    isChecked: boolean;
    isUserModified: boolean;
    onToggle: () => void;
}

export const NarrativeSection = ({ title, children, presetName, isChecked, isUserModified, onToggle }: NarrativeSectionProps) => {

    const { t } = useI18n();

    const checkboxWithLabel = (
        <div className="flex items-center space-x-2">
            <Checkbox id={`preset-${presetName}`} checked={isChecked} onCheckedChange={onToggle} disabled={isUserModified} />
            <Label htmlFor={`preset-${presetName}`} className="text-sm font-medium">{t('arrestReport.advancedForm.narrative.enablePreset')}</Label>
        </div>
    );

    return (
      <>
        <TableRow className="h-3" />
        <TableRow>
          <TableHead className="bg-secondary gap-x-2" colSpan={5}>
            <div className="flex flex-wrap justify-between items-center relative">
              <a>{title}</a>
              {isUserModified ? (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                           {checkboxWithLabel}
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>{t('arrestReport.advancedForm.narrative.clearToReenable')}</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
              ) : (
                checkboxWithLabel
              )}
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
  
  export const EvidenceLog: React.FC<EvidenceLogProps> = ({ fields, register, onRemove, onAdd, onKeyUp }) => {
    const { t } = useI18n();
    return (
        <TableBody>
            <TableRow>
            <TableHead className="bg-secondary" colSpan={2}>{t('arrestReport.advancedForm.evidenceLog.logNumber')}</TableHead>
            <TableHead className="bg-secondary" colSpan={2}>{t('arrestReport.advancedForm.evidenceLog.description')}</TableHead>
            <TableHead className="bg-secondary" colSpan={1}>{t('arrestReport.advancedForm.evidenceLog.quantity')}</TableHead>
            </TableRow>
            {fields.map((field, index) => (
            <TableRow key={field.id}>
                <TableCell colSpan={2}><Input placeholder="EL/2/LOGNO./YEAR" {...register(`evidenceLogs.${index}.logNumber`)} onKeyUp={onKeyUp} /></TableCell>
                <TableCell colSpan={2}><Input placeholder={t('arrestReport.advancedForm.evidenceLog.itemDescriptionPlaceholder', { index: index + 1 })} {...register(`evidenceLogs.${index}.description`)} onKeyUp={onKeyUp} /></TableCell>
                <TableCell>
                <div className="flex items-center gap-1">
                    <Input placeholder={t('arrestReport.advancedForm.evidenceLog.quantity')} {...register(`evidenceLogs.${index}.quantity`)} onKeyUp={onKeyUp}/>
                    <Button variant="ghost" size="icon" onClick={() => onRemove(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
                </TableCell>
            </TableRow>
            ))}
            <TableRow>
                <TableCell colSpan={5} className="p-1">
                    <Button className="w-full" type="button" onClick={onAdd}>
                        <CirclePlus className="mr-2 h-4 w-4" /> {t('arrestReport.advancedForm.evidenceLog.add')}
                    </Button>
                </TableCell>
            </TableRow>
        </TableBody>
  );
}
