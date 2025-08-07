'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/dashboard/page-header';
import { Plus, Trash2 } from 'lucide-react';

interface Charge {
  id: string;
  charge: string;
  type: 'F' | 'M' | 'I';
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
}

const getTypeColor = (type: Charge['type']) => {
  switch (type) {
    case 'F':
      return 'text-red-500';
    case 'M':
      return 'text-yellow-500';
    case 'I':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

export function ArrestCalculatorPage() {
  const [penalCode, setPenalCode] = useState<PenalCode>({});
  const [charges, setCharges] = useState<SelectedCharge[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Reset dependent fields if chargeId changes
        if (field === 'chargeId') {
          updatedCharge.class = null;
          updatedCharge.offense = null;
          updatedCharge.addition = null;
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

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Arrest Calculator"
        description="Calculate arrest sentences based on charges."
      />

      <div className="space-y-4">
        {charges.map((chargeRow) => {
          const chargeDetails = getChargeDetails(chargeRow.chargeId);

          return (
            <div
              key={chargeRow.uniqueId}
              className="flex items-end gap-2 p-4 border rounded-lg"
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Charge Dropdown */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor={`charge-${chargeRow.uniqueId}`}>Charge</Label>
                  <Select
                    value={chargeRow.chargeId || ''}
                    onValueChange={(value) =>
                      updateCharge(chargeRow.uniqueId, 'chargeId', value)
                    }
                  >
                    <SelectTrigger id={`charge-${chargeRow.uniqueId}`}>
                      <SelectValue placeholder="Select a charge..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(penalCode).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className={`${getTypeColor(c.type)} font-bold mr-2`}>
                            {c.id}
                          </span>
                          {c.charge}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <SelectTrigger id={`class-${chargeRow.uniqueId}`}>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A" disabled={!chargeDetails?.class?.A}>Class A</SelectItem>
                      <SelectItem value="B" disabled={!chargeDetails?.class?.B}>Class B</SelectItem>
                      <SelectItem value="C" disabled={!chargeDetails?.class?.C}>Class C</SelectItem>
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
                    <SelectTrigger id={`offense-${chargeRow.uniqueId}`}>
                      <SelectValue placeholder="Select offense" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1" disabled={!chargeDetails?.offence['1']}>Offense 1</SelectItem>
                        <SelectItem value="2" disabled={!chargeDetails?.offence['2']}>Offense 2</SelectItem>
                        <SelectItem value="3" disabled={!chargeDetails?.offence['3']}>Offense 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                 {/* Addition Dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor={`addition-${chargeRow.uniqueId}`}>Addition</Label>
                   <Select
                    value={chargeRow.addition || ''}
                    onValueChange={(value) =>
                      updateCharge(chargeRow.uniqueId, 'addition', value)
                    }
                    disabled={!chargeDetails}
                  >
                    <SelectTrigger id={`addition-${chargeRow.uniqueId}`}>
                      <SelectValue placeholder="Select addition" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Offender">Offender</SelectItem>
                        <SelectItem value="Accomplice">Accomplice</SelectItem>
                        <SelectItem value="Accessory">Accessory</SelectItem>
                        <SelectItem value="Conspiracy">Conspiracy</SelectItem>
                        <SelectItem value="Attempt">Attempt</SelectItem>
                        <SelectItem value="Solicitation">Solicitation</SelectItem>
                        <SelectItem value="Parole Violation">Parole Violation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCharge(chargeRow.uniqueId)}
                className="text-red-500 hover:text-red-700"
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
        {loading && <p>Loading penal code...</p>}
      </div>
    </div>
  );
}
