"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar } from "lucide-react";

// Types
import type { ScenarioId } from "@orbat-mapper/msdllib";
import type { ScenarioIdType } from "@orbat-mapper/msdllib/dist/lib/scenarioid";

// UI Components
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
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FormFooter from "@/components/FormFooter"; 

type FormVariant = "new" | "edit";

interface Props {
  item: ScenarioId;
  variant?: FormVariant;
  onCancel: () => void;
  onUpdate: (value: Partial<ScenarioIdType>) => void;
}

// 1. Zod Schema (Bỏ toTypedSchema của vee-validate)
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  modificationDate: z.string(),
  securityClassification: z.string(),
  type: z.string(),
  version: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ScenarioIdEditForm({ 
  item, 
  variant = "edit", 
  onCancel, 
  onUpdate 
}: Props) {
  
  // 2. Setup Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item.name || "",
      description: item.description || "",
      modificationDate: item.modificationDate || "",
      securityClassification: item.securityClassification || "",
      type: item.type || "",
      version: item.version || "",
    },
    mode: "onBlur", // validate-on-blur tương đương
  });

  // 3. Handlers
  const onSubmit = (values: FormValues) => {
    onUpdate(values);
  };

  const setCurrentDate = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn submit form
    const today = new Date().toISOString().split("T")[0];
    form.setValue("modificationDate", today, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-6">
          
          {/* --- Name --- */}
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

          {/* --- Description --- */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- Security Classification --- */}
          <FormField
            control={form.control}
            name="securityClassification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Security classification</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. UNCLASSIFIED" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- Modification Date (With Calendar Button) --- */}
          <FormField
            control={form.control}
            name="modificationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modification date</FormLabel>
                <FormControl>
                  <div className="flex w-full max-w-sm items-center gap-1.5">
                    <Input placeholder="YYYY-MM-DD" {...field} />
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={setCurrentDate}
                            type="button"
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Set to current date</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- Type --- */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- Version --- */}
          <FormField
            control={form.control}
            name="version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Version</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormFooter
            id="scenario-edit-form-footer"
            onCancel={onCancel}
            submitText={variant === "new" ? "Create" : "Save"}
          />
        </form>
      </Form>
    </div>
  );
}