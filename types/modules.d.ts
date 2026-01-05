// Type declarations for libraries that may not have @types packages

declare module "xml-beautify" {
  export default class XmlBeautify {
    constructor(options?: any);
    beautify(xml: string, options?: any): string;
  }
}

declare module "fuzzysort" {
  export function go<T>(
    search: string,
    targets: T[],
    options?: any
  ): Array<{ target: T; score: number }>;
}

declare module "trickling" {
  export function createTrickling(options?: any): {
    start(): void;
    done(): void;
    set(value: number): void;
  };
}

declare module "@/extlib/tokml" {
  import type { Root } from "@tmcw/togeojson";
  export function foldersToKML(root: Root, sidcs: string[]): string;
}