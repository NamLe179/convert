"use client";

import { useState, useEffect, useMemo, HTMLAttributes } from "react";
import { SisoEnum } from "@siso-entity-type/lib";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils"; 
import { useEntityTypeStore } from "@/stores/entityTypeStore";

import EntityCombobox from "@/components/EntityTypeForm";
import EntitySearch from "@/components/EntityTypeSearch";  

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function PanelDataGrid({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("grid grid-cols-[100px_1fr] gap-2 items-center text-sm", className)} 
      {...props}
    >
      {children}
    </div>
  );
}

interface Props {
  value: string | undefined;      // Tương đương defineModel trong Vue
  onChange: (value: string) => void; 
}

// Định nghĩa kiểu keys cho mapping
type FieldKey = "Country" | "Kind" | "Domain" | "Category" | "Subcategory" | "Specific" | "Extra";

export default function EntityTypePanel({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [typeQuery, setTypeQuery] = useState("");

  // Store access
  const store = useEntityTypeStore();
  
  // Logic hiển thị (Display Mode) 
  const sisoEntityType = useMemo(() => {
    return value ? SisoEnum.fromString(value) : null;
  }, [value]);

  const displayFields = useMemo(() => {
    if (!sisoEntityType) return [];
    const { sisoEnums } = store; 
    
    // Kiểm tra null safe cho sisoEnums
    if (!sisoEnums || Object.keys(sisoEnums).length === 0) return [];

    const fields = [
      { label: "Kind", value: sisoEnums.getKindName?.(sisoEntityType) || "" },
      { label: "Domain", value: sisoEnums.getDomainName?.(sisoEntityType) || "" },
      { label: "Country", value: sisoEnums.getCountryName?.(sisoEntityType) || "" },
      { label: "Category", value: sisoEnums.getCategoryName?.(sisoEntityType) || "" },
      { label: "Subcategory", value: sisoEnums.getSubcategoryName?.(sisoEntityType) || "" },
      { label: "Specific", value: sisoEnums.getSpecificName?.(sisoEntityType) || "" },
      { label: "Extra", value: sisoEnums.getExtraName?.(sisoEntityType) || "" },
    ];

    // Lọc bỏ các trường trùng nhau liên tiếp (như logic Vue)
    return fields.reduce((acc, field) => {
      if (acc.length === 0 || acc[acc.length - 1].value !== field.value) {
        acc.push(field);
      }
      return acc;
    }, [] as { label: string; value: string }[]);
  }, [sisoEntityType, store.sisoEnums]);

  // Logic populate Store (Edit Mode) 
  const populateBuilder = async (entType: string) => {
    if (!entType) return;
    const parts = entType.split(".").map((s) => +s);
    
    // Validate độ dài chuỗi SISO (thường là 7 phần)
    if (parts.length < 7) {
      console.warn(`Could not populate entitytype: ${entType}`);
      return;
    }
    
    // Gọi action store để set các giá trị
    await store.selectCountry(parts[2], false); // false = keepKindAndDomain logic
    await store.selectKind(parts[0]);
    await store.selectDomain(parts[1]);
    await store.selectCategory(parts[3]);
    await store.selectSubcategory(parts[4]);
    await store.selectSpecific(parts[5]);
    await store.selectExtra(parts[6]);
  };

  // Khi mở Dialog, sync prop 'value' vào Store và input query
  useEffect(() => {
    if (open && value) {
      setTypeQuery(value);
      store.resetCategories();
      populateBuilder(value);
    }
  }, [open]); 

  // Set input
  const handleSetTypeManual = async () => {
    store.resetCategories();
    await populateBuilder(typeQuery);
  };

  // save change
  const handleSave = () => {
    const { 
      selectedKind, selectedDomain, selectedCountry, 
      selectedCategory, selectedSubcategory, selectedSpecific, selectedExtra 
    } = store;

    const newType = `${selectedKind || 0}.${selectedDomain || 0}.${selectedCountry || 0}.${selectedCategory || 0}.${selectedSubcategory || 0}.${selectedSpecific || 0}.${selectedExtra || 0}`;
    
    onChange(newType);
    setOpen(false); // Đóng dialog
  };

  // Mapping cấu hình cho vòng lặp render dropdowns
  const dropdownConfigs: { label: FieldKey; value: number | null; action: (v: number | null) => void }[] = [
    { label: "Kind", value: store.selectedKind, action: store.selectKind },
    { label: "Domain", value: store.selectedDomain, action: store.selectDomain },
    { label: "Country", value: store.selectedCountry, action: (v) => store.selectCountry(v) },
    { label: "Category", value: store.selectedCategory, action: store.selectCategory },
    { label: "Subcategory", value: store.selectedSubcategory, action: store.selectSubcategory },
    { label: "Specific", value: store.selectedSpecific, action: store.selectSpecific },
    { label: "Extra", value: store.selectedExtra, action: store.selectExtra },
  ];

  const currentStoreString = `${store.selectedKind || 0}.${store.selectedDomain || 0}.${store.selectedCountry || 0}.${store.selectedCategory || 0}.${store.selectedSubcategory || 0}.${store.selectedSpecific || 0}.${store.selectedExtra || 0}`;

  return (
    <div>
      {/* --- Display Header --- */}
      <div className="text-sm font-bold mt-2 flex items-center justify-between">
        <span className="text-muted-foreground font-medium">
          Entity type: {value || "Unknown"}
        </span>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="mr-2 h-8 px-2 lg:px-3">
              Edit
              <Pencil className="size-4 ml-2" />
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit entity type</DialogTitle>
              <DialogDescription>
                Make changes to the entity type. Click save when done.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* --- Manual Input Section --- */}
              <div className="flex w-full items-center gap-2">
                <Label htmlFor="entityTypeInput" className="text-nowrap min-w-[80px]">
                  Entity type:
                </Label>
                <Input 
                  id="entityTypeInput"
                  type="text" 
                  value={typeQuery} 
                  onChange={(e) => setTypeQuery(e.target.value)}
                  placeholder="x.x.x.x.x.x.x"
                />
                <Button type="button" onClick={handleSetTypeManual}>Set</Button>
              </div>

              {/* --- Separator --- */}
              <div className="relative flex items-center justify-center overflow-hidden">
                <Separator />
                <div className="absolute px-2 text-center bg-background text-xs text-muted-foreground">
                  OR
                </div>
              </div>

              {/* --- Dropdown Grid Section --- */}
              <PanelDataGrid>
                {dropdownConfigs.map((field) => (
                  <div key={field.label} className="contents"> 
                    <span className="p-2 font-medium">{field.label}</span>
                    <EntityCombobox
                      label={field.label}
                      value={field.value}
                      onChange={(val) => field.action(val)}
                      updateMethod={() => {}} 
                    />
                  </div>
                ))}
              </PanelDataGrid>

              {/* --- Search Section --- */}
              <div className="space-y-2">
                <Label className="text-nowrap">Search by description</Label>
                <EntitySearch populateBuilder={populateBuilder} />
              </div>
            </div>

            <Separator />

            {/* --- Footer --- */}
            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Input type="text" value={currentStoreString} disabled className="bg-muted text-center font-mono" />
              <DialogClose asChild>
                <Button type="submit" onClick={handleSave}>
                  Save changes
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Separator className="my-2" />

      {/* --- Display Details Grid --- */}
      {sisoEntityType ? (
        <PanelDataGrid className="mt-4">
          {displayFields.map((field, index) => (
            <div key={`${field.label}-${index}`} className="contents">
              <span className="font-semibold">{field.label}</span>
              <span>{field.value}</span>
            </div>
          ))}
        </PanelDataGrid>
      ) : (
        <PanelDataGrid className="mt-4">
          <span className="font-semibold col-span-2 text-muted-foreground">
            No entity type provided
          </span>
        </PanelDataGrid>
      )}
    </div>
  );
}