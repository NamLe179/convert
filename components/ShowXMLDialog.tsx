"use client";

import { useMemo, ReactNode } from "react";
import { CodeXml } from "lucide-react"; 
import XmlBeautify from "xml-beautify";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  // item là optional, chứa element là DOM Element
  item?: { element?: Element };
  title?: string;
  // children tương đương với <slot /> trong Vue
  children?: ReactNode;
}

export default function XmlPreview({ 
  item = { element: undefined }, 
  title, 
  children 
}: Props) {
  
  // Logic tính toán prettyXML (tương đương computed)
  const prettyXML = useMemo(() => {
    // Kiểm tra tính hợp lệ của element
    if (!item.element || !(item.element instanceof Element)) {
      return "No XML element available.";
    }

    // Format XML
    return new XmlBeautify().beautify(item.element.outerHTML, {
      indent: "  ",
      useSelfClosingElement: true,
    });
  }, [item.element]); // Chỉ tính lại khi element thay đổi

  // Logic tính toán Description (tương đương computed)
  const dialogDescription = useMemo(() => {
    if (!item.element || !(item.element instanceof Element)) {
      return "No XML element available.";
    }
    return `XML for ${item.element.tagName} element.`;
  }, [item.element]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" title={title}>
          <CodeXml className="mr-2 h-4 w-4" /> 
          {children}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-auto sm:max-w-[calc(100%-8rem)]">
        <DialogHeader>
          <DialogTitle>XML preview</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[80vh] overflow-auto">
          <pre className="text-sm" tabIndex={1}>
            {prettyXML}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}