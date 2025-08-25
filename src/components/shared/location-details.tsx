
'use client';

import { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { useFormStore } from '@/stores/form-store';
import configData from '../../../data/config.json';

interface LocationDetailsProps {
    districtFieldName: string;
    streetFieldName: string;
    showDistrict?: boolean;
}

export function LocationDetails({
    districtFieldName,
    streetFieldName,
    showDistrict = true,
}: LocationDetailsProps) {
    const { control, watch } = useFormContext();
    const [locations, setLocations] = useState<{ districts: string[], streets: string[] }>({ districts: [], streets: [] });
    const { setFormField } = useFormStore();


    useEffect(() => {
        fetch(configData.CONTENT_DELIVERY_NETWORK+'?file=gtaw_locations.json')
            .then(res => res.json())
            .then(data => {
                const uniqueDistricts = [...new Set<string>(data.districts || [])];
                const uniqueStreets = [...new Set<string>(data.streets || [])];
                setLocations({ districts: uniqueDistricts, streets: uniqueStreets });
            })
            .catch(err => console.error("Failed to fetch locations:", err));
    }, []);

    const districtValue = watch(districtFieldName);
    const streetValue = watch(streetFieldName);
    const isDistrictInvalid = !districtValue;
    const isStreetInvalid = !streetValue;

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {showDistrict && (
                <div className="grid gap-2">
                    <Label htmlFor={districtFieldName}>District</Label>
                    <Controller
                        name={districtFieldName}
                        control={control}
                        rules={{ required: 'District is required' }}
                        render={({ field }) => (
                            <Combobox
                                options={locations.districts}
                                value={field.value}
                                onChange={(value) => {
                                    field.onChange(value);
                                    setFormField('location', 'district', value);
                                }}
                                placeholder="Select or type a district"
                                searchPlaceholder="Search districts..."
                                emptyPlaceholder="No districts found."
                                isInvalid={isDistrictInvalid}
                            />
                        )}
                    />
                </div>
            )}
            <div className="grid gap-2">
                <Label htmlFor={streetFieldName}>Street Name</Label>
                <Controller
                    name={streetFieldName}
                    control={control}
                    rules={{ required: 'Street is required' }}
                    render={({ field }) => (
                         <Combobox
                            options={locations.streets}
                            value={field.value}
                            onChange={(value) => {
                                field.onChange(value);
                                setFormField('location', 'street', value);
                            }}
                            placeholder="Select or type a street"
                            searchPlaceholder="Search streets..."
                            emptyPlaceholder="No streets found."
                            isInvalid={isStreetInvalid}
                        />
                    )}
                />
            </div>
        </div>
    );
}
