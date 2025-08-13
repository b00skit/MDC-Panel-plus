
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { Plus, Trash2, ChevronsUpDown, AlertTriangle } from 'lucide-react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useChargeStore, type SelectedCharge, type Charge, type PenalCode } from '@/stores/charge-store';
import { useFormStore } from '@/stores/form-store';
import { useOfficerStore } from '@/stores/officer-store';
import { useToast } from '@/hooks/use-toast';
import { useAdvancedReportStore } from '@/stores/advanced-report-store';

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

export function ArrestCalculatorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    charges, 
    penalCode, 
    setPenalCode, 
    addCharge, 
    removeCharge, 
    updateCharge, 
    setReport,
    resetCharges,
  } = useChargeStore();
  const resetForm = useFormStore(state => state.reset);
  const resetAdvancedForm = useAdvancedReportStore(state => state.reset);


  const [loading, setLoading] = useState(true);
  const [openChargeSelector, setOpenChargeSelector] = useState<number | null>(
    null
  );

  const getChargeDetails = useCallback((chargeId: string | null): Charge | null => {
    if (!chargeId || !penalCode) return null;
    return penalCode[chargeId] || null;
  }, [penalCode]);

  useEffect(() => {
    // Reset charges when the component mounts to start with a clean slate
    resetCharges();
    fetch('https://sys.booskit.dev/cdn/serve.php?file=gtaw_penal_code.json')
      .then((res) => res.json())
      .then((data: PenalCode) => {
        setPenalCode(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch penal code:', error);
        setLoading(false);
      });
  }, [setPenalCode, resetCharges]);
  
  const handleCalculate = () => {
     if (charges.length === 0) {
      toast({ title: "No Charges", description: "Please add at least one charge.", variant: "destructive" });
      return;
    }

     for (const charge of charges) {
      if (!charge.chargeId) {
        toast({ title: "Incomplete Charge", description: "Please select a charge for all rows.", variant: "destructive" });
        return;
      }
      if (!charge.class) {
        toast({ title: "Incomplete Charge", description: `Please select a class for "${penalCode?.[charge.chargeId]?.charge}".`, variant: "destructive" });
        return;
      }
      if (!charge.offense) {
        toast({ title: "Incomplete Charge", description: `Please select an offense for "${penalCode?.[charge.chargeId]?.charge}".`, variant: "destructive" });
        return;
      }
      if (!charge.addition) {
        toast({ title: "Incomplete Charge", description: `Please select an addition for "${penalCode?.[charge.chargeId]?.charge}".`, variant: "destructive" });
        return;
      }
      const chargeDetails = getChargeDetails(charge.chargeId);
      if (chargeDetails?.drugs && !charge.category) {
        toast({ title: "Incomplete Charge", description: `Please select a category for the drug charge "${chargeDetails.charge}".`, variant: "destructive" });
        return;
      }
    }
    setReport(charges);
    resetForm();
    resetAdvancedForm();
    router.push('/arrest-report');
  }

  const penalCodeArray = useMemo(() => penalCode ? Object.values(penalCode) : [], [penalCode]);

  const showDrugChargeWarning = useMemo(() => {
    return charges.some(charge => {
        const details = getChargeDetails(charge.chargeId);
        return !!details?.drugs;
    });
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
  
    let defaultClass: string | null = null;
    if (chargeDetails.class?.A) defaultClass = 'A';
    else if (chargeDetails.class?.B) defaultClass = 'B';
    else if (chargeDetails.class?.C) defaultClass = 'C';
  
    let defaultOffense: string | null = null;
    if (chargeDetails.offence?.['1']) defaultOffense = '1';
    else if (chargeDetails.offence?.['2']) defaultOffense = '2';
    else if (chargeDetails.offence?.['3']) defaultOffense = '3';
  
    updateCharge(chargeRow.uniqueId, {
      chargeId: chargeId,
      class: defaultClass,
      offense: defaultOffense,
      addition: 'Offender',
      category: null, // Reset category on new charge selection
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Arrest Calculator"
        description="Calculate arrest sentences based on charges."
      />

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button onClick={() => addCharge()} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" /> Add Charge
          </Button>

          <Button variant="default" disabled={charges.length === 0} onClick={handleCalculate}>
            Calculate Arrest
          </Button>
        </div>

        {charges.map((chargeRow) => {
          const chargeDetails = getChargeDetails(chargeRow.chargeId);
          const isDrugCharge = !!chargeDetails?.drugs;

          return (
            <div
              key={chargeRow.uniqueId}
              className="flex items-end gap-2 p-4 border rounded-lg"
            >
              <div
                className={cn(
                  'flex-1 grid grid-cols-1 md:grid-cols-5 gap-2 items-end',
                  isDrugCharge && 'md:grid-cols-6'
                )}
              >
                {/* Charge Dropdown */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Charge</Label>
                  <Popover
                    open={openChargeSelector === chargeRow.uniqueId}
                    onOpenChange={(isOpen) =>
                      setOpenChargeSelector(isOpen ? chargeRow.uniqueId : null)
                    }
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
                                getTypeClasses(penalCode[chargeRow.chargeId].type)
                              )}
                            >
                              {penalCode[chargeRow.chargeId].id}
                            </Badge>
                            <span className="truncate">
                              {penalCode[chargeRow.chargeId].charge}
                            </span>
                          </span>
                        ) : (
                          'Select a charge...'
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command
                        filter={(value, search) => {
                           if (!penalCode) return 0;
                          const charge = penalCodeArray.find(
                            (c) => c.id === value
                          );
                          if (!charge) return 0;

                          const term = search.toLowerCase();
                          const chargeName = charge.charge.toLowerCase();
                          const chargeId = charge.id;

                          if (
                            chargeName.includes(term) ||
                            chargeId.includes(term)
                          ) {
                            return 1;
                          }
                          return 0;
                        }}
                      >
                        <CommandInput placeholder="Search charge by name or ID..." />
                        <CommandEmpty>No charge found.</CommandEmpty>
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
                                      chargeRow.chargeId === c.id
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                <Badge
                                  className={cn(
                                    'mr-2 rounded-sm px-1.5 py-0.5 text-xs',
                                    getTypeClasses(c.type)
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
                  <Label htmlFor={`class-${chargeRow.uniqueId}`}>Class</Label>
                  <Select
                    value={chargeRow.class || ''}
                    onValueChange={(value) =>
                      updateCharge(chargeRow.uniqueId, { class: value })
                    }
                    disabled={!chargeDetails}
                    required
                  >
                    <SelectTrigger id={`class-${chargeRow.uniqueId}`} className="h-9">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A" disabled={!chargeDetails?.class?.A}>
                        Class A
                      </SelectItem>
                      <SelectItem value="B" disabled={!chargeDetails?.class?.B}>
                        Class B
                      </SelectItem>
                      <SelectItem value="C" disabled={!chargeDetails?.class?.C}>
                        Class C
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Offense Dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor={`offense-${chargeRow.uniqueId}`}>Offense</Label>
                  <Select
                    value={chargeRow.offense || ''}
                    onValueChange={(value) =>
                      updateCharge(chargeRow.uniqueId, { offense: value })
                    }
                    disabled={!chargeDetails}
                    required
                  >
                    <SelectTrigger id={`offense-${chargeRow.uniqueId}`} className="h-9">
                      <SelectValue placeholder="Select offense" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="1"
                        disabled={!chargeDetails?.offence['1']}
                      >
                        Offense #1
                      </SelectItem>
                      <SelectItem
                        value="2"
                        disabled={!chargeDetails?.offence['2']}
                      >
                        Offense #2
                      </SelectItem>
                      <SelectItem
                        value="3"
                        disabled={!chargeDetails?.offence['3']}
                      >
                        Offense #3
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Addition Dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor={`addition-${chargeRow.uniqueId}`}>
                    Addition
                  </Label>
                  <Select
                    value={chargeRow.addition || ''}
                    onValueChange={(value) =>
                      updateCharge(chargeRow.uniqueId, { addition: value })
                    }
                    disabled={!chargeDetails}
                    required
                  >
                    <SelectTrigger
                      id={`addition-${chargeRow.uniqueId}`}
                      className="h-9"
                    >
                      <SelectValue placeholder="Select addition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Offender">Offender</SelectItem>
                      <SelectItem value="Accomplice">Accomplice</SelectItem>
                      <SelectItem value="Accessory">Accessory</SelectItem>
                      <SelectItem value="Conspiracy">Conspiracy</SelectItem>
                      <SelectItem value="Attempt">Attempt</SelectItem>
                      <SelectItem value="Solicitation">Solicitation</SelectItem>
                      <SelectItem value="Parole Violation">
                        Parole Violation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Dropdown (for drug charges) */}
                {isDrugCharge && (
                  <div className="space-y-1.5">
                    <Label htmlFor={`category-${chargeRow.uniqueId}`}>
                      Category
                    </Label>
                    <Select
                      value={chargeRow.category || ''}
                      onValueChange={(value) =>
                        updateCharge(chargeRow.uniqueId, { category: value })
                      }
                      disabled={!chargeDetails}
                      required
                    >
                      <SelectTrigger
                        id={`category-${chargeRow.uniqueId}`}
                        className="h-9"
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {chargeDetails?.drugs &&
                          Object.entries(chargeDetails.drugs).map(
                            ([key, value]) => (
                              <SelectItem key={key} value={value}>
                                {value}
                              </SelectItem>
                            )
                          )}
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
        
        {showDrugChargeWarning && (
            <Alert variant="warning" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                   Please ensure you select the correct Category for drug charges. Check the warrant (if applicable) for more information.<br/>
                   Reference: Drug Enforcement & Prevention Act of 2020 (DEPA)
                </AlertDescription>
            </Alert>
        )}

        {loading && <p>Loading penal code...</p>}
      </div>
    </div>
  );
}
