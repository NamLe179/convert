"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Types & Enums
import type { MsdlOptionsType, MsdlOptions } from "@orbat-mapper/msdllib/dist/lib/msdlOptions";
import {
  EnumEchelon,
  SymbologyStandard,
  CoordinateSystem,
} from "@orbat-mapper/msdllib/dist/lib/enums";

// UI Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormFooter from "@/components/FormFooter"; 

// 1. Define Props & Types
type FormVariant = "new" | "edit";

interface Props {
  item: MsdlOptions;
  variant?: FormVariant;
  onCancel: () => void;
  onUpdate: (value: Partial<MsdlOptionsType>) => void;
}

// 2. Schema Definition
const formSchema = z.object({
  msdlVersion: z.string().min(1, "MSDLVersion is required"),
  aggregateBased: z.string(),
  aggregateEchelon: z.string(),
  standardName: z.string(),
  majorVersion: z.string(),
  minorVersion: z.string(),
  coordinateSystemType: z.string(),
  coordinateSystemDatum: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MsdlOptionsForm({ 
  item, 
  variant = "edit", 
  onCancel, 
  onUpdate 
}: Props) {
  
  // 3. Prepare Options
  const echelonOptions = Object.entries(EnumEchelon).map(([key, value]) => ({
    label: key,
    value: value,
  }));

  const standardNameOptions = Object.entries(SymbologyStandard).map(([key, value]) => ({
    label: key,
    value: value,
  }));

  const coordinateSystemTypeOptions = Object.entries(CoordinateSystem).map(([key, value]) => ({
    label: key,
    value: value,
  }));

  // 4. Setup Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      msdlVersion: item.msdlVersion || "",
      aggregateBased: item.aggregateBased || "",
      aggregateEchelon: item.aggregateEchelon || "",
      standardName: item.standardName || "",
      majorVersion: item.majorVersion || "",
      minorVersion: item.minorVersion || "",
      coordinateSystemType: item.coordinateSystemType || "",
      coordinateSystemDatum: item.coordinateSystemDatum || "",
    },
  });

  // 5. Submit Handler
  const onSubmit = (values: FormValues) => {
    onUpdate(values);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-6">
          
          {/* --- MSDL Version --- */}
          <FormField
            control={form.control}
            name="msdlVersion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MSDLVersion</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- Aggregate Based --- */}
          <FormField
            control={form.control}
            name="aggregateBased"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AggregateBased</FormLabel>
                <FormControl>
                  <Input placeholder="n/a" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- Aggregate Echelon (Select with Clear) --- */}
          <FormField
            control={form.control}
            name="aggregateEchelon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AggregateEchelon</FormLabel>
                <div className="flex gap-4">
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value} 
                    value={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="n/a" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {echelonOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={(e) => {
                      e.preventDefault();
                      field.onChange("");
                    }}
                  >
                    Clear
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- Standard Name (Select with Clear) --- */}
          <FormField
            control={form.control}
            name="standardName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>StandardName</FormLabel>
                <div className="flex gap-4">
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="n/a" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {standardNameOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={(e) => {
                      e.preventDefault();
                      field.onChange("");
                    }}
                  >
                    Clear
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- Major Version --- */}
          <FormField
            control={form.control}
            name="majorVersion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MajorVersion</FormLabel>
                <FormControl>
                  <Input placeholder="n/a" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- Minor Version --- */}
          <FormField
            control={form.control}
            name="minorVersion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MinorVersion</FormLabel>
                <FormControl>
                  <Input placeholder="n/a" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- Coordinate System Type (Disabled) --- */}
          <FormField
            control={form.control}
            name="coordinateSystemType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CoordinateSystemType</FormLabel>
                <div className="flex gap-4">
                  <Select 
                    disabled 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="n/a" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {coordinateSystemTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    disabled
                    onClick={(e) => {
                      e.preventDefault();
                      field.onChange("");
                    }}
                  >
                    Clear
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- Coordinate System Datum --- */}
          <FormField
            control={form.control}
            name="coordinateSystemDatum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CoordinateSystemDatum</FormLabel>
                <FormControl>
                  <Input placeholder="n/a" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormFooter 
            onCancel={onCancel} 
            submitText={variant === "new" ? "Create" : "Save"} 
          />
        </form>
      </Form>
    </div>
  );
}