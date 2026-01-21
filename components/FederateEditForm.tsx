"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Federate, FederateTypeInput } from "@orbat-mapper/msdllib";

// UI Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FormFooter from "@/components/FormFooter"; 

// 1. Define Props & Types
interface Props {
  item: Federate;
  variant?: "new" | "edit";
  onCancel: () => void;
  onUpdate: (value: Partial<FederateTypeInput>) => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function FederateForm({ item, variant, onCancel, onUpdate }: Props) {
  // 2. Setup Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item.name || "",
    },
  });

  // 3. Submit Handler
  const onSubmit = (values: FormValues) => {
    onUpdate(values);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-6">
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormFooter
            onCancel={onCancel}
            submitText={variant === "new" ? "Create" : "Update"}
          />
        </form>
      </Form>
    </div>
  );
}