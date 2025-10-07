'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/dashboard/page-header';
import { Plus, Trash2, ChevronsUpDown, AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  useChargeStore,
  type SelectedCharge,
  type Charge,
  type PenalCode,
  type Addition,
} from '@/stores/charge-store';
import { useFormStore } from '@/stores/form-store';
import { useToast } from '@/hooks/use-toast';
import { useAdvancedReportStore } from '@/stores/advanced-report-store';
import { useAdvancedReportModifiersStore } from '@/stores/advanced-report-modifiers-store';
import configData from '../../../data/config.json';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { useBasicReportModifiersStore } from '@/stores/basic-report-modifiers-store';
import { Checkbox } from '../ui/checkbox';
import { areStreetCharges } from '@/lib/code-enhancement';
import { StreetsAlert } from '../shared/streets-act-warning';
import { useI18n, useScopedI18n } from '@/lib/i18n/client';

const getTypeClasses = (type: Charge['type']) => {
  switch (type) {
    case 'F':
      return 'bg-red-500 hover:bg-red-500/80 text-white';
    case 'M':
      return 'bg-yellow-500 hover:bg-yellow-500/80 text-white';
    case 'I':
      return 'bg-green-500 hover:bg-green-500/80 text-white';
    default:
      return 'bg-gray-500 hover:bg-gray-500/80 text-white';
  }
};

interface DepaCategory {
  title: string;
  substances: string[];
}

interface DepaData {
  categories: DepaCategory[];
}

export function ArrestCalculatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isModifyMode = searchParams.get('modify') === 'true';
  const { t } = useI18n();
  const tPage = useScopedI18n('arrestCalculator.page');

  const { toast } = useToast();
  const {
    charges,
    penalCode,
    additions,
    setPenalCode,
    setAdditions,
    addCharge,
    removeCharge,
    updateCharge,
    setReport,
    resetCharges,
    setCharges,
    report,
    isParoleViolator,
    reportIsParoleViolator,
    setParoleViolator,
  } = useChargeStore();
  const resetForm = useFormStore((state) => state.reset);
  const resetAdvancedForm = useAdvancedReportStore((state) => state.reset);
  const resetModifiers = useBasicReportModifiersStore((state) => state.reset);
  const resetAdvancedModifiers = useAdvancedReportModifiersStore((state) => state.reset);

  const [loading, setLoading] = useState(true);
  const [openChargeSelector, setOpenChargeSelector] = useState<number | null>(null);
  const [depaData, setDepaData] = useState<DepaData | null>(null);

  const getChargeDetails = useCallback(
    (chargeId: string | null): Charge | null => {
      if (!chargeId || !penalCode) return null;
      return penalCode[chargeId] || null;
    },
    [penalCode],
  );

  useEffect(() => {
    document.title = t('arrestCalculator.page.documentTitle');
  }, [t]);

  useEffect(() => {
    if (isModifyMode) {
      setCharges(report); // Load report charges into the calculator for editing
      setParoleViolator(reportIsParoleViolator);
    } else {
      resetCharges();
    }

    Promise.all([
      fetch(`${configData.CONTENT_DELIVERY_NETWORK}?file=gtaw_penal_code.json`).then((res) => res.json()),
      fetch('/data/additions.json').then((res) => res.json()),
      fetch(`${configData.CONTENT_DELIVERY_NETWORK}?file=gtaw_depa_categories.json`).then((res) => res.json()),
    ])
      .then(([penalCodeData, additionsData, depaData]) => {
        setPenalCode(penalCodeData);
        setAdditions(additionsData.additions);
        setDepaData(depaData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch initial data:', error);
        setLoading(false);
      });
  }, [
    setPenalCode,
    resetCharges,
    isModifyMode,
    report,
    setCharges,
    setAdditions,
    reportIsParoleViolator,
    setParoleViolator,
  ]);

  const handleCalculate = () => {
    if (charges.length === 0) {
      toast({
        title: tPage('toasts.noCharges.title'),
        description: tPage('toasts.noCharges.description'),
        variant: 'destructive',
      });
      return;
    }

    for (const charge of charges) {

      if (!charge.chargeId) {
        toast({
          title: tPage('toasts.incomplete.title'),
          description: tPage('toasts.incomplete.selectCharge'),
          variant: 'destructive',
        });
        return;
      }
      const chargeDetails = getChargeDetails(charge.chargeId);
      const chargeName = chargeDetails?.charge
      if (!chargeName) {
         // TODO: What to show if the charge is invalid?
      } else {
        if (!charge.class) {
          toast({
            title: tPage('toasts.incomplete.title'),
            description: tPage('toasts.incomplete.selectClass', {
              charge: chargeName,
            }),
            variant: 'destructive',
          });
          return;
        }
        if (!charge.offense) {
          toast({
            title: tPage('toasts.incomplete.title'),
            description: tPage('toasts.incomplete.selectOffense', {
              charge: chargeName,
            }),
            variant: 'destructive',
          });
          return;
        }
        if (!charge.addition) {
          toast({
            title: tPage('toasts.incomplete.title'),
            description: tPage('toasts.incomplete.selectAddition', {
              charge: chargeName,
            }),
            variant: 'destructive',
          });
          return;
        }
        
        if (chargeDetails?.drugs && !charge.category) {
          toast({
            title: tPage('toasts.incomplete.title'),
            description: tPage('toasts.incomplete.selectCategory', { charge: chargeName }),
            variant: 'destructive',
          });
          return;
        }
      }
    }
    setReport(charges);
    if (!isModifyMode) {
      resetForm();
      resetAdvancedForm();
      resetModifiers();
      resetAdvancedModifiers();
    }
    resetCharges();
    router.push('/arrest-report');
  };

  const penalCodeArray = useMemo(() => (penalCode ? Object.values(penalCode) : []), [penalCode]);
  const additionsWithoutParole = useMemo(
    () => additions.filter((a) => a.name !== configData.PAROLE_VIOLATION_DEFINITION),
    [additions],
  );

  const showDrugChargeWarning = useMemo(() => {
    return charges.some((charge) => {
      const details = getChargeDetails(charge.chargeId);
      return !!details?.drugs;
    });
  }, [charges, getChargeDetails]);

  const showStreetsActWarning = useMemo(() => {
    const chargesDetails = charges.map((charge: SelectedCharge) => getChargeDetails(charge.chargeId));
    return areStreetCharges(charges, chargesDetails);
  }, [charges, getChargeDetails]);

  const handleChargeSelect = (chargeRow: SelectedCharge, chargeId: string) => {
    if (!penalCode) return;

    const isDeselecting = chargeRow.chargeId === chargeId;
    if (isDeselecting) {
      updateCharge(chargeRow.uniqueId, {
        chargeId: null,
        class: null,
        offense: null,
        addition: null,
        category: null,
      });
      return;
    }

    const chargeDetails = penalCode[chargeId];
    if (!chargeDetails) return;

    const defaultClass: string | null =
      Object.entries(chargeDetails.class).find((chargeClass) => chargeClass[1])?.[0] ?? null;

    const defaultOffense: string | null = '1';

    updateCharge(chargeRow.uniqueId, {
      chargeId,
      class: defaultClass,
      offense: defaultOffense,
      addition: 'Offender',
      category: null, // Reset category on new charge selection
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader title={tPage('header.title')} description={tPage('header.description')} />

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button onClick={() => addCharge()} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" /> {tPage('buttons.addCharge')}
          </Button>

          <Button variant="default" disabled={charges.length === 0} onClick={handleCalculate}>
            {tPage('buttons.calculate')}
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="parole-violator"
            checked={isParoleViolator}
            onCheckedChange={(value) => setParoleViolator(value === true)}
          />
          <Label htmlFor="parole-violator" className="text-base font-medium">
            {tPage('paroleViolatorLabel')}
          </Label>
        </div>

        {charges.map((chargeRow) => {
          const chargeDetails = getChargeDetails(chargeRow.chargeId);
          const isDrugCharge = !!chargeDetails?.drugs;

          return (
            <div key={chargeRow.uniqueId} className="flex items-end gap-2 p-4 border rounded-lg">
              <div
                className={cn(
                  'flex-1 grid grid-cols-1 md:grid-cols-5 gap-2 items-end',
                  isDrugCharge && 'md:grid-cols-6',
                )}
              >
                {/* Charge Dropdown */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label>{tPage('fields.charge')}</Label>
                  <Popover
                    open={openChargeSelector === chargeRow.uniqueId}
                    onOpenChange={(isOpen) => setOpenChargeSelector(isOpen ? chargeRow.uniqueId : null)}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openChargeSelector === chargeRow.uniqueId}
                        className="w-full justify-between h-9"
                        disabled={loading}
                      >
                        {chargeRow.chargeId && penalCode && penalCode[chargeRow.chargeId] ? (
                          <span className="flex items-center">
                            <Badge
                              className={cn(
                                'mr-2 rounded-sm px-1.5 py-0.5 text-xs',
                                getTypeClasses(penalCode[chargeRow.chargeId].type),
                              )}
                            >
                              {penalCode[chargeRow.chargeId].id}
                            </Badge>
                            <span className="truncate">{penalCode[chargeRow.chargeId].charge}</span>
                          </span>
                        ) : (
                          tPage('placeholders.selectCharge')
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command
                        filter={(value, search) => {
                          if (!penalCode) return 0;
                          const charge = penalCodeArray.find((c) => c.id === value);
                          if (!charge) return 0;

                          const term = search.toLowerCase();
                          const chargeName = charge.charge.toLowerCase();
                          const chargeId = charge.id;

                          if (chargeName.includes(term) || chargeId.includes(term)) {
                            return 1;
                          }
                          return 0;
                        }}
                      >
                        <CommandInput placeholder={tPage('placeholders.searchCharge')} />
                        <CommandEmpty>{tPage('noChargeFound')}</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {penalCodeArray.map((c) => (
                              <CommandItem
                                key={c.id}
                                value={c.id}
                                onSelect={(currentValue) => {
                                  handleChargeSelect(chargeRow, currentValue);
                                  setOpenChargeSelector(null);
                                }}
                                disabled={c.type === '?'}
                                className="flex items-center"
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    chargeRow.chargeId === c.id ? 'opacity-100' : 'opacity-0',
                                  )}
                                />
                                <Badge
                                  className={cn(
                                    'mr-2 rounded-sm px-1.5 py-0.5 text-xs',
                                    getTypeClasses(c.type),
                                  )}
                                >
                                  {c.id}
                                </Badge>
                                <span className="flex-1 truncate">{c.charge}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Class Dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor={`class-${chargeRow.uniqueId}`}>{tPage('fields.class')}</Label>
                  <Select
                    value={chargeRow.class || ''}
                    onValueChange={(value) => updateCharge(chargeRow.uniqueId, { class: value })}
                    disabled={!chargeDetails}
                    required
                  >
                    <SelectTrigger id={`class-${chargeRow.uniqueId}`} className="h-9">
                      <SelectValue placeholder={tPage('placeholders.selectClass')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A" disabled={!chargeDetails?.class?.A}>
                        {tPage('options.classA')}
                      </SelectItem>
                      <SelectItem value="B" disabled={!chargeDetails?.class?.B}>
                        {tPage('options.classB')}
                      </SelectItem>
                      <SelectItem value="C" disabled={!chargeDetails?.class?.C}>
                        {tPage('options.classC')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Offense Dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor={`offense-${chargeRow.uniqueId}`}>{tPage('fields.offense')}</Label>
                  <Select
                    value={chargeRow.offense || ''}
                    onValueChange={(value) => updateCharge(chargeRow.uniqueId, { offense: value })}
                    disabled={!chargeDetails}
                    required
                  >
                    <SelectTrigger id={`offense-${chargeRow.uniqueId}`} className="h-9">
                      <SelectValue placeholder={tPage('placeholders.selectOffense')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1" disabled={!chargeDetails?.offence['1']}>
                        {tPage('options.offense', { number: 1 })}
                      </SelectItem>
                      <SelectItem value="2" disabled={!chargeDetails?.offence['2']}>
                        {tPage('options.offense', { number: 2 })}
                      </SelectItem>
                      <SelectItem value="3" disabled={!chargeDetails?.offence['3']}>
                        {tPage('options.offense', { number: 3 })}
                      </SelectItem>
                      <SelectItem value="4" disabled={!chargeDetails?.offence['4']}>
                        {tPage('options.offense', { number: 4 })}
                      </SelectItem>
                      <SelectItem value="5" disabled={!chargeDetails?.offence['5']}>
                        {tPage('options.offense', { number: 5 })}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Addition Dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor={`addition-${chargeRow.uniqueId}`}>{tPage('fields.addition')}</Label>
                  <Select
                    value={chargeRow.addition || ''}
                    onValueChange={(value) => updateCharge(chargeRow.uniqueId, { addition: value })}
                    disabled={!chargeDetails}
                    required
                  >
                    <SelectTrigger id={`addition-${chargeRow.uniqueId}`} className="h-9">
                      <SelectValue placeholder={tPage('placeholders.selectAddition')} />
                    </SelectTrigger>
                    <SelectContent>
                      {additionsWithoutParole.map((addition) => (
                        <SelectItem key={addition.name} value={addition.name}>
                          {addition.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Dropdown (for drug charges) */}
                {isDrugCharge && (
                  <div className="space-y-1.5">
                    <Label htmlFor={`category-${chargeRow.uniqueId}`}>{tPage('fields.category')}</Label>
                    <Select
                      value={chargeRow.category || ''}
                      onValueChange={(value) => updateCharge(chargeRow.uniqueId, { category: value })}
                      disabled={!chargeDetails}
                      required
                    >
                      <SelectTrigger id={`category-${chargeRow.uniqueId}`} className="h-9">
                        <SelectValue placeholder={tPage('placeholders.selectCategory')} />
                      </SelectTrigger>
                      <SelectContent>
                        {chargeDetails?.drugs &&
                          Object.entries(chargeDetails.drugs).map(([key, value]) => (
                            <SelectItem key={key} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCharge(chargeRow.uniqueId)}
                className="text-red-500 hover:text-red-700 h-9 w-9"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          );
        })}

        {showStreetsActWarning && <StreetsAlert />}

        {showDrugChargeWarning && (
          <Alert variant="warning" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{tPage('depaWarning.title')}</AlertTitle>
            <AlertDescription>
              {tPage('depaWarning.description')}{' '}
              <a
                href={configData.URL_DEPA}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-700"
              >
                {tPage('depaWarning.link')}
              </a>
            </AlertDescription>
          </Alert>
        )}

        {showDrugChargeWarning && depaData && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>{tPage('depaCategories.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {depaData.categories.map((category, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-lg">{category.title}</h4>
                  <Separator className="my-2" />
                  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 list-disc pl-5 text-muted-foreground">
                    {category.substances.map((substance) => (
                      <li key={substance}>{substance}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {loading && <p>{tPage('loadingPenalCode')}</p>}
      </div>
    </div>
  );
}