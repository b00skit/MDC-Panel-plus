
import { Control, UseFormRegister, UseFormWatch, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { OfficerSection } from "../arrest-report/officer-section";
import { GeneralSection } from "../arrest-report/general-section";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { type PenalCode } from '@/stores/charge-store';
import { Combobox } from '../ui/combobox';
import { PaperworkChargeField } from './paperwork-generator-charge-field';
import { LocationDetails } from '../shared/location-details';

type FormField = {
  type: 'text' | 'textarea' | 'dropdown' | 'officer' | 'general' | 'section' | 'hidden' | 'toggle' | 'datalist' | 'charge' | 'group' | 'location';
  name: string;
  label?: string;
  placeholder?: string;
  options?: string[];
  optionsSource?: 'districts' | 'streets' | 'vehicles';
  title?: string;
  value?: string;
  dataOn?: string;
  dataOff?: string;
  defaultValue?: any;
  required?: boolean;
  stipulation?: {
    field: string;
    value: any;
  },
  fields?: FormField[]; // For group type
  // Charge field specific config
  showClass?: boolean;
  showOffense?: boolean;
  showAddition?: boolean;
  showCategory?: boolean;
  allowedTypes?: { F?: boolean, M?: boolean, I?: boolean };
  allowedIds?: string;
  customFields?: FormField[];
  previewFields?: {
    sentence?: boolean;
    fine?: boolean;
    impound?: boolean;
    suspension?: boolean;
  }
  // Location field specific config
  showDistrict?: boolean;
};

export const renderField = (
    field: FormField, 
    index: number, 
    control: Control<any>, 
    register: UseFormRegister<any>, 
    watch: UseFormWatch<any>, 
    penalCode: PenalCode | null,
    locations: { districts: string[], streets: string[] },
    vehicles: string[]
) => {
    const key = `${field.name || field.title}-${index}`;

    if (field.stipulation) {
        const watchedValue = watch(field.stipulation.field);
        if (watchedValue !== field.stipulation.value) {
            return null;
        }
    }

    switch (field.type) {
      case 'hidden':
          return <input key={key} type="hidden" {...register(field.name)} defaultValue={field.value} />;

      case 'section':
          return (
              <div key={key}>
                  <Separator className="my-4" />
                  <h4 className="mb-2 text-xl font-semibold tracking-tight">{field.title}</h4>
              </div>
          );

      case 'general':
          return <GeneralSection key={key} isSubmitted={false} />;
      
      case 'officer':
          return <OfficerSection key={key} isSubmitted={false} isArrestReport={false} />;

      case 'location':
          return <LocationDetails 
                      key={key}
                      districtFieldName={`${field.name}.district`}
                      streetFieldName={`${field.name}.street`}
                      showDistrict={field.showDistrict !== false}
                      isSubmitted={false}
                  />;

      case 'text':
        return (
          <div key={key} className="w-full">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input id={field.name} {...register(field.name, { required: field.required })} placeholder={field.placeholder} />
          </div>
        );

      case 'datalist':
          return (
            <div key={key} className="w-full">
                <Label htmlFor={field.name}>{field.label}</Label>
                 <Controller
                    control={control}
                    name={field.name!}
                    rules={{ required: field.required }}
                    render={({ field: { onChange, value } }) => {
                         let options: string[] = [];
                         if (field.optionsSource === 'districts') options = locations.districts;
                         else if (field.optionsSource === 'streets') options = locations.streets;
                         else if (field.optionsSource === 'vehicles') options = vehicles;

                        return (
                            <Combobox
                                options={options}
                                value={value}
                                onChange={onChange}
                                placeholder={field.placeholder}
                                searchPlaceholder='Search...'
                                emptyPlaceholder='No results.'
                            />
                        )
                    }}
                />
            </div>
        );

      case 'textarea':
          return (
              <div key={key} className="w-full">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Textarea id={field.name} {...register(field.name, { required: field.required })} placeholder={field.placeholder} className="min-h-[120px]" />
              </div>
          );

      case 'dropdown':
          return (
              <div key={key} className="w-full">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Controller
                      control={control}
                      name={field.name!}
                      rules={{ required: field.required }}
                      render={({ field: { onChange, value } }) => (
                          <Select onValueChange={onChange} value={value}>
                              <SelectTrigger id={field.name}>
                                  <SelectValue placeholder={field.placeholder} />
                              </SelectTrigger>
                              <SelectContent>
                              {field.options?.map((option) => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                              </SelectContent>
                          </Select>
                      )}
                  />
              </div>
          );

      case 'toggle':
          return (
              <div key={key} className="flex items-center space-x-2 pt-6">
                   <Controller
                      name={field.name!}
                      control={control}
                      defaultValue={field.defaultValue === true}
                      render={({ field: { onChange, value } }) => (
                          <Switch
                              id={field.name}
                              checked={value}
                              onCheckedChange={onChange}
                          />
                      )}
                  />
                  <Label htmlFor={field.name}>
                      {watch(field.name!) ? field.dataOn : field.dataOff}
                  </Label>
              </div>
          );

      case 'charge':
          return (
              <PaperworkChargeField 
                key={key}
                control={control}
                register={register}
                watch={watch}
                penalCode={penalCode}
                config={{
                    name: field.name,
                    showClass: field.showClass,
                    showOffense: field.showOffense,
                    showAddition: field.showAddition,
                    showCategory: field.showCategory,
                    allowedTypes: field.allowedTypes,
                    allowedIds: field.allowedIds,
                    customFields: field.customFields,
                    previewFields: field.previewFields,
                }}
              />
          );

      case 'group':
          return (
              <div key={key} className="flex flex-col md:flex-row items-end gap-4 w-full">
                  {field.fields?.map((subField, subIndex) => renderField(subField, subIndex, control, register, watch, penalCode, locations, vehicles))}
              </div>
          );

      default:
        return null;
    }
};
