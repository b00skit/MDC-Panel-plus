'use client';

import { useState, useEffect, useMemo } from 'react';
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

interface Charge {
  id: string;
  charge: string;
  type: 'F' | 'M' | 'I' | '?';
  class: { A: boolean; B: boolean; C: boolean };
  offence: { '1': boolean; '2': boolean; '3': boolean };
  drugs?: Record<string, string>;
}

interface PenalCode {
  [key: string]: Charge;
}

interface SelectedCharge {
  uniqueId: number;
  chargeId: string | null;
  class: string | null;
  offense: string | null;
  addition: string | null;
  category: string | null;
}

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
  const [penalCode, setPenalCode] = useState<PenalCode>({});
  const [charges, setCharges] = useState<SelectedCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [openChargeSelector, setOpenChargeSelector] = useState<number | null>(
    null
  );

  useEffect(() => {
    fetch('https://sys.booskit.dev/cdn/serve.php?file=gtaw_penal_code.json')
      .then((res) => res.json())
      .then((data) => {
        setPenalCode(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch penal code:', error);
        setLoading(false);
      });
  }, []);

  const addCharge = () => {
    setCharges([
      ...charges,
      {
        uniqueId: Date.now(),
        chargeId: null,
        class: null,
        offense: null,
        addition: null,
        category: null,
      },
    ]);
  };

  const removeCharge = (uniqueId: number) => {
    setCharges(charges.filter((charge) => charge.uniqueId !== uniqueId));
  };

  const updateCharge = (
    uniqueId: number,
    field: keyof SelectedCharge,
    value: string
  ) => {
    const newCharges = charges.map((charge) => {
      if (charge.uniqueId === uniqueId) {
        const updatedCharge = { ...charge, [field]: value };
        if (field === 'chargeId') {
          updatedCharge.class = null;
          updatedCharge.offense = null;
          updatedCharge.addition = null;
          updatedCharge.category = null;
        }
        return updatedCharge;
      }
      return charge;
    });
    setCharges(newCharges);
  };

  const getChargeDetails = (chargeId: string | null): Charge | null => {
    if (!chargeId) return null;
    return penalCode[chargeId] || null;
  };

  const penalCodeArray = Object.values(penalCode);

  const showDrugChargeWarning = useMemo(() => {
    return charges.some(charge => {
        const details = getChargeDetails(charge.chargeId);
        return !!details?.drugs;
    });
  }, [charges, penalCode]);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Arrest Calculator"
        description="Calculate arrest sentences based on charges."
      />

      <div className="space-y-4">
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
                        {chargeRow.chargeId && penalCode[chargeRow.chargeId] ? (
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
                                  updateCharge(
                                    chargeRow.uniqueId,
                                    'chargeId',
                                    currentValue === chargeRow.chargeId
                                      ? ''
                                      : currentValue
                                  );
                                  setOpenChargeSelector(null);
                                }}
                                disabled={c.type === '?'}
                                className="flex items-center"
                              >
                                <div className="w-6">
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      chargeRow.chargeId === c.id
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                </div>
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
                      updateCharge(chargeRow.uniqueId, 'class', value)
                    }
                    disabled={!chargeDetails}
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
                      updateCharge(chargeRow.uniqueId, 'offense', value)
                    }
                    disabled={!chargeDetails}
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
                      updateCharge(chargeRow.uniqueId, 'addition', value)
                    }
                    disabled={!chargeDetails}
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
                        updateCharge(chargeRow.uniqueId, 'category', value)
                      }
                      disabled={!chargeDetails}
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

        <div className="flex items-center gap-4 mt-4">
          <Button onClick={addCharge} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" /> Add Charge
          </Button>

          <Button variant="default" disabled={charges.length === 0}>
            Calculate Arrest
          </Button>
        </div>
        
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
