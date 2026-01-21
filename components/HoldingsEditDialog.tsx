"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CirclePlus, Trash2 } from "lucide-react";

// Types
import type { Holding, HoldingType } from "@orbat-mapper/msdllib";

// Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormFooter from "@/components/FormFooter"; 

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holdings: Array<Holding>;
  parentName: string;
  onCancel: () => void;
  onUpdate: (values: Array<HoldingType>) => void;
}

// Schema Validation
const formSchema = z.object({
  holdings: z.array(
    z.object({
      nsnName: z.string(),
      nsnCode: z.string().min(1, "NSN Code is required"),
      // Sử dụng coerce để tự động ép kiểu từ input string sang number
      onHandQuantity: z.coerce.number(), 
    }),
  ),
});

type FormValues = z.infer<typeof formSchema>;

export default function HoldingsDialog({
  open,
  onOpenChange,
  holdings,
  parentName,
  onCancel,
  onUpdate,
}: Props) {
  // 1. Setup Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      holdings: [], // populate bởi useEffect
    },
  });

  // 2. Setup Dynamic Array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "holdings",
  });

  // 3. Sync Props to Form State (Thay thế logic resetForm của Vue)
  useEffect(() => {
    if (open) {
      form.reset({
        holdings: holdings.map((h) => ({
          nsnName: h.nsnName || "",
          nsnCode: h.nsnCode || "",
          onHandQuantity: h.onHandQuantity || 0,
        })),
      });
    }
  }, [open, holdings, form]);

  // 4. Submit Handler
  const onSubmit = (values: FormValues) => {
    // Ép kiểu về HoldingType array 
    onUpdate(values.holdings as Array<HoldingType>);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-auto sm:max-w-[calc(100%-8rem)] max-h-[90dvh] flex-col flex">
        <DialogHeader className="flex-none">
          <DialogTitle>Holdings</DialogTitle>
          <DialogDescription>Edit holdings of {parentName}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
            {/* Wrapper div để tạo scroll area cho table nếu danh sách dài */}
            <div className="flex-1 overflow-auto min-h-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>NSN code</TableHead>
                    <TableHead>On hand</TableHead>
                    <TableHead className="w-[50px]">{/* empty for actions */}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      {/* --- NSN Name --- */}
                      <TableCell className="w-1/3 align-top">
                        <FormField
                          control={form.control}
                          name={`holdings.${index}.nsnName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* --- NSN Code --- */}
                      <TableCell className="w-1/3 align-top">
                        <FormField
                          control={form.control}
                          name={`holdings.${index}.nsnCode`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* --- On Hand Quantity --- */}
                      <TableCell className="w-1/3 align-top">
                        <FormField
                          control={form.control}
                          name={`holdings.${index}.onHandQuantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="any" 
                                  placeholder="" 
                                  {...field} 
                                  onChange={(e) => field.onChange(e.target.value)} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* --- Remove Action --- */}
                      <TableCell className="align-top">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* --- Add Button Row --- */}
                  <TableRow className="hover:!bg-transparent">
                    <TableCell colSpan={4} className="text-center p-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={(e) => {
                          e.preventDefault(); // Ngăn submit form nhầm
                          append({ nsnName: "", nsnCode: "", onHandQuantity: 0 });
                        }}
                      >
                        Add holding
                        <CirclePlus className="ml-2 size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <DialogFooter className="mt-4 flex-none">
              <FormFooter onCancel={onCancel} />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}