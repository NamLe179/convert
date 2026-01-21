"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MilitaryServiceItems, type ForceSide } from "@orbat-mapper/msdllib";
import type { ScenarioIdType } from "@orbat-mapper/msdllib/dist/lib/scenarioid";

import {
  Form,
  FormControl,
  FormDescription,
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
import FormFooter from "@/components/FormFooter"; 

// 1. Define Props & Schema
interface Props {
  item: ForceSide;
  onCancel: () => void;
  onUpdate: (values: Partial<ScenarioIdType>) => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  militaryService: z.string().optional(),
  countryCode: z.string().max(3).toUpperCase().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForceSideForm({ item, onCancel, onUpdate }: Props) {
  // 2. Setup Form Hook
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item.name || "",
      militaryService: item.militaryService || "",
      countryCode: item.countryCode || "",
    },
  });

  // 3. Submit Handler
  const onSubmit = (values: FormValues) => {
    // Ép kiểu về Partial<ScenarioIdType> để khớp với interface update
    onUpdate(values as unknown as Partial<ScenarioIdType>);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-6">
          
          {/* --- Name Field --- */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- Military Service Field (Select) --- */}
          <FormField
            control={form.control}
            name="militaryService"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Military service</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a military service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {MilitaryServiceItems.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- Country Code Field --- */}
          <FormField
            control={form.control}
            name="countryCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. USA" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormDescription>Use 3 letter country code</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Footer actions */}
          <FormFooter onCancel={onCancel} />
        </form>
      </Form>
    </div>
  );
}