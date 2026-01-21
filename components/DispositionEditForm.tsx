"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { DispositionBase, DispositionType } from "@orbat-mapper/msdllib";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FormFooter from "@/components/FormFooter";

interface Props {
  disposition: DispositionBase;
  onCancel: () => void;
  onUpdate: (value: Partial<DispositionType>) => void;
}

// 1. Helper Schema: Chấp nhận string/number/null
const numericString = z.union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)));

// 2. Define Schema
const formSchema = z.object({
  // Bắt buộc: sau khi transform phải là number hợp lệ
  latitude: numericString.pipe(z.number().min(-90).max(90)),
  longitude: numericString.pipe(z.number().min(-180).max(180)),
  
  // Optional: sau khi transform có thể là number hoặc undefined
  elevation: numericString.pipe(z.number().optional()),
  directionOfMovement: numericString.pipe(z.number().min(0).max(360).optional()),
  speed: numericString.pipe(z.number().optional()),
});

// 3. Define Types cho Input và Output
// z.input: kiểu dữ liệu trước khi validate (cho phép string | number)
// z.output: kiểu dữ liệu sau khi validate (chỉ number)
type FormInput = z.input<typeof formSchema>; 
type FormOutput = z.output<typeof formSchema>;

export default function DispositionForm({ disposition, onCancel, onUpdate }: Props) {
  
  // 4. Khai báo Generics cho useForm
  const form = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      latitude: disposition.location?.[1] || 0,  
      longitude: disposition.location?.[0] || 0, 
      elevation: disposition.location?.[2],
      directionOfMovement: disposition.directionOfMovement,
      speed: disposition.speed,
    },
  });

  // 5. onSubmit sẽ nhận vào values có kiểu FormOutput 
  const onSubmit = (values: FormOutput) => {
    let location: [number, number] | [number, number, number];

    // GeoJSON format: [longitude, latitude, elevation?]
    // Kiểm tra elevation khác undefined và khác null
    if (typeof values.elevation === 'number') {
      location = [values.longitude, values.latitude, values.elevation];
    } else {
      location = [values.longitude, values.latitude];
    }

    const result: Partial<DispositionType> = {
      directionOfMovement: values.directionOfMovement,
      speed: values.speed,
      location: location,
    };
    
    onUpdate(result);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-6">
          
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="elevation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Elevation</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="directionOfMovement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Direction of Movement</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>Direction of movement in degrees (0-360)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="speed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Speed</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>Speed of the item</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormFooter onCancel={onCancel} />
        </form>
      </Form>
    </div>
  );
}