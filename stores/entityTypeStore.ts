import { create } from "zustand";
import { SisoEnums, type SisoEnumsDataType } from "@siso-entity-type/lib";

interface EntityTypeState {
  // Data
  sisoEnums: SisoEnums;
  searchResults: Record<string, string>;
  allKinds: Map<number, string>;
  allDomains: Map<number, string>;
  allCountries: Map<number, string>;
  allCategories: Map<number, string>;
  allSubcategories: Map<number, string>;
  allSpecifics: Map<number, string>;
  allExtras: Map<number, string>;
  
  // Selected values
  selectedKind: number | null;
  selectedDomain: number | null;
  selectedCountry: number | null;
  selectedCategory: number | null;
  selectedSubcategory: number | null;
  selectedSpecific: number | null;
  selectedExtra: number | null;
  
  // Actions
  init: () => Promise<void>;
  parseSisoEnums: () => Promise<void>;
  search: (query: string) => Promise<void>;
  getKinds: () => Promise<void>;
  getCountries: () => Promise<void>;
  
  resetCategories: () => void;
  selectCountry: (country: number | null, keepKindAndDomain?: boolean) => Promise<void>;
  selectKind: (kind: number | null) => Promise<void>;
  selectDomain: (domain: number | null) => Promise<void>;
  selectCategory: (category: number | null) => Promise<void>;
  selectSubcategory: (subcategory: number | null) => Promise<void>;
  selectSpecific: (specific: number | null) => Promise<void>;
  selectExtra: (extra: number | null) => Promise<void>;
}

export const useEntityTypeStore = create<EntityTypeState>((set, get) => ({
  // Initial state
  sisoEnums: {} as SisoEnums,
  searchResults: {},
  allKinds: new Map<number, string>(),
  allDomains: new Map<number, string>(),
  allCountries: new Map<number, string>(),
  allCategories: new Map<number, string>(),
  allSubcategories: new Map<number, string>(),
  allSpecifics: new Map<number, string>(),
  allExtras: new Map<number, string>(),
  selectedKind: null,
  selectedDomain: null,
  selectedCountry: null,
  selectedCategory: null,
  selectedSubcategory: null,
  selectedSpecific: null,
  selectedExtra: null,
  
  // Initialize store
  init: async () => {
    await get().parseSisoEnums();
    await get().getKinds();
    await get().getCountries();
  },
  
  // Parse SISO enums from JSON
  parseSisoEnums: async () => {
    try {
      const sisoEnums = new SisoEnums();
      // In Next.js, we need to fetch the JSON file from node_modules
      // Option 1: Copy JSON to public folder and fetch from there
      // Option 2: Import JSON directly (works in Next.js 13+)
      const enumsModule = await import("@siso-entity-type/lib/data/siso-enums.json");
      const enumsMap = enumsModule.default as SisoEnumsDataType;
      
      await sisoEnums.initialize(enumsMap);
      set({ sisoEnums });
      console.log("Parsed SISO enums");
    } catch (error) {
      console.error("Failed to parse SISO enums:", error);
    }
  },
  
  // Search for entity types
  search: async (query) => {
    if (!query || query.length <= 2) {
      set({ searchResults: {} });
      return;
    }
    const { sisoEnums } = get();
    const searchResults = sisoEnums.searchDescription(query);
    set({ searchResults });
    console.log(`${Object.keys(searchResults).length} results for ${query}`);
  },
  
  // Get all kinds
  getKinds: async () => {
    const { sisoEnums } = get();
    const allKinds = sisoEnums.getAllKinds();
    set({ allKinds });
  },
  
  // Get all countries
  getCountries: async () => {
    const { sisoEnums } = get();
    const allCountries = sisoEnums.getAllCountries();
    set({ allCountries });
  },
  
  // Reset category selections
  resetCategories: () => {
    set({
      allCategories: new Map(),
      allSubcategories: new Map(),
      allSpecifics: new Map(),
      allExtras: new Map(),
      selectedCategory: 0,
      selectedSubcategory: 0,
      selectedSpecific: 0,
      selectedExtra: 0,
    });
  },
  
  // Select country
  selectCountry: async (country, keepKindAndDomain = true) => {
    const { selectedCountry, selectedKind, selectedDomain } = get();
    if (selectedCountry === country) return;
    
    set({ selectedCountry: country });
    get().resetCategories();
    
    if (keepKindAndDomain && selectedKind != null && selectedKind > 0) {
      if ((selectedDomain ?? 0) > 0) {
        const domain = selectedDomain;
        await get().selectKind(selectedKind);
        await get().selectDomain(domain);
      } else {
        await get().selectKind(selectedKind);
      }
    } else {
      set({ selectedKind: 0, selectedDomain: 0 });
    }
  },
  
  // Select kind
  selectKind: async (kind) => {
    const { selectedKind, allDomains, sisoEnums } = get();
    if (selectedKind === kind && allDomains.size > 0) return;
    
    const newDomains = sisoEnums.getAllDomainsOf(kind ?? 0);
    set({ selectedKind: kind, allDomains: newDomains, selectedDomain: 0 });
    get().resetCategories();
  },
  
  // Select domain
  selectDomain: async (domain) => {
    const { selectedDomain, allCategories, sisoEnums, selectedKind, selectedCountry } = get();
    if (selectedDomain === domain && allCategories.size > 0) return;
    
    set({ selectedDomain: domain });
    get().resetCategories();
    
    const newCategories = sisoEnums.getAllCategoriesOf(
      selectedKind ?? 0,
      domain ?? 0,
      selectedCountry ?? 0
    );
    set({ allCategories: newCategories, selectedCategory: 0 });
  },
  
  // Select category
  selectCategory: async (category) => {
    const { selectedCategory, allSubcategories, sisoEnums, selectedKind, selectedDomain, selectedCountry } = get();
    if (selectedCategory === category && allSubcategories.size > 0) return;
    
    const newSubcategories = sisoEnums.getAllSubcategoriesOf(
      selectedKind ?? 0,
      selectedDomain ?? 0,
      selectedCountry ?? 0,
      category ?? 0
    );
    set({ selectedCategory: category, allSubcategories: newSubcategories, selectedSubcategory: 0 });
  },
  
  // Select subcategory
  selectSubcategory: async (subcategory) => {
    const { selectedSubcategory, allSpecifics, sisoEnums, selectedKind, selectedDomain, selectedCountry, selectedCategory } = get();
    if (selectedSubcategory === subcategory && allSpecifics.size > 0) return;
    
    const newSpecifics = sisoEnums.getAllSpecificsOf(
      selectedKind ?? 0,
      selectedDomain ?? 0,
      selectedCountry ?? 0,
      selectedCategory ?? 0,
      subcategory ?? 0
    );
    set({ selectedSubcategory: subcategory, allSpecifics: newSpecifics, selectedSpecific: 0 });
  },
  
  // Select specific
  selectSpecific: async (specific) => {
    const { selectedSpecific, allExtras, sisoEnums, selectedKind, selectedDomain, selectedCountry, selectedCategory, selectedSubcategory } = get();
    if (selectedSpecific === specific && allExtras.size > 0) return;
    
    const newExtras = sisoEnums.getAllExtrasOf(
      selectedKind ?? 0,
      selectedDomain ?? 0,
      selectedCountry ?? 0,
      selectedCategory ?? 0,
      selectedSubcategory ?? 0,
      specific ?? 0
    );
    set({ selectedSpecific: specific, allExtras: newExtras, selectedExtra: 0 });
  },
  
  // Select extra
  selectExtra: async (extra) => {
    const { selectedExtra } = get();
    if (selectedExtra === extra) return;
    set({ selectedExtra: extra });
  },
}));

// Computed/derived values (use these in components)
export const useEntityTypeSelectors = () => {
  const state = useEntityTypeStore();
  
  return {
    kinds: Array.from(state.allKinds.entries()).map(([value, title]) => ({ title, value })),
    domains: Array.from(state.allDomains.entries()).map(([value, title]) => ({ title, value })),
    countries: Array.from(state.allCountries.entries()).map(([value, title]) => ({ title, value })),
    categories: Array.from(state.allCategories.entries()).map(([value, title]) => ({ title, value })),
    subcategories: Array.from(state.allSubcategories.entries()).map(([value, title]) => ({ title, value })),
    specifics: Array.from(state.allSpecifics.entries()).map(([value, title]) => ({ title, value })),
    extras: Array.from(state.allExtras.entries()).map(([value, title]) => ({ title, value })),
    selectedEntityType: `${state.selectedKind || 0}.${state.selectedDomain || 0}.${state.selectedCountry || 0}.${state.selectedCategory || 0}.${state.selectedSubcategory || 0}.${state.selectedSpecific || 0}.${state.selectedExtra || 0}`,
  };
};