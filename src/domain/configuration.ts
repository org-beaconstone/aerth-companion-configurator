/**
 * AERTH Configurator Domain Layer
 * Typed product catalog, validation, persistence, and serialization
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

import { PALETTE_SOURCE, PRODUCT_PALETTE } from '../design/palette';

export type Size = 'small' | 'medium' | 'large';
export type Type = 'retractable'; // Only retractable design is now available
export type Coating = 'ribbed' | 'cushioned' | 'cork';
export type Color = 'red' | 'blue' | 'yellow';
export type VehicleColor = 'sage' | 'chalk' | 'graphite' | 'teal';
export type Material = 'aluminum' | 'polypropylene' | 'cork';

export type Configuration = {
  size: Size;
  type: Type;
  coating: Coating;
  color: Color;
  vehicleColor: VehicleColor;
  material: Material;
};

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_CONFIG: Configuration = {
  size: 'medium',
  type: 'retractable',
  coating: 'ribbed',
  color: 'blue',
  vehicleColor: 'chalk',
  material: 'aluminum',
} as const;

// ============================================================================
// PRODUCT CATALOG
// ============================================================================

export const SIZES = [
  {
    id: 'small' as const,
    label: 'Small',
    description: 'Compact dog ramp for small breeds',
    width: 40,
    length: 180,
    price: 180,
  },
  {
    id: 'medium' as const,
    label: 'Medium',
    description: 'Standard dog ramp for medium breeds',
    width: 50,
    length: 210,
    price: 280,
  },
  {
    id: 'large' as const,
    label: 'Large',
    description: 'Full-size dog ramp for large breeds',
    width: 60,
    length: 240,
    price: 420,
  },
] as const;

// Only retractable ramp is available; always integrated with stow capability.
// Type field remains for configuration export compatibility but is fixed to 'retractable'.
export const TYPES = [
  {
    id: 'retractable' as const,
    label: 'Retractable',
    description: 'Compact telescoping design with underfloor stow',
    price: 120, // Integrated into total price; not shown as separate charge
  },
] as const;

export const COATINGS = [
  {
    id: 'ribbed' as const,
    label: 'Ribbed grip',
    description: 'Traditional textured grip surface',
    price: 0,
  },
  {
    id: 'cushioned' as const,
    label: 'Cushioned tread',
    description: 'Soft-touch polymer surface',
    price: 40,
  },
  {
    id: 'cork' as const,
    label: 'Cork touch',
    description: 'Natural cork composite surface',
    price: 60,
  },
] as const;

export const COLORS = [
  {
    id: 'red' as const,
    label: 'Canyon red',
    ...PRODUCT_PALETTE.red,
    description: 'ADS Red700 finish',
  },
  {
    id: 'blue' as const,
    label: 'Ocean blue',
    ...PRODUCT_PALETTE.blue,
    description: 'ADS Blue700 finish',
  },
  {
    id: 'yellow' as const,
    label: 'Solar yellow',
    ...PRODUCT_PALETTE.yellow,
    description: 'ADS Yellow300 finish',
  },
] as const;

export const VEHICLE_COLORS = [
  {
    id: 'sage' as const,
    label: 'Sage',
    ...PRODUCT_PALETTE.sage,
    description: 'ADS Green800 finish',
  },
  {
    id: 'chalk' as const,
    label: 'Chalk',
    ...PRODUCT_PALETTE.chalk,
    description: 'Matte ADS Neutral300 finish',
  },
  {
    id: 'graphite' as const,
    label: 'Graphite',
    ...PRODUCT_PALETTE.graphite,
    description: 'ADS Neutral800 finish',
  },
  {
    id: 'teal' as const,
    label: 'Teal',
    ...PRODUCT_PALETTE.teal,
    description: 'ADS Teal800 finish',
  },
] as const;

export const MATERIALS = [
  {
    id: 'aluminum' as const,
    label: 'Recycled aluminum',
    description: 'Lightweight structural deck',
    detail:
      'Candidate recycled aluminum rails and frame; verify alloy and recycled content with supplier documentation.',
    caveat:
      'Material composition and recycled content claims require independent supplier testing and engineering validation.',
    price: 0,
  },
  {
    id: 'polypropylene' as const,
    label: 'Recycled polypropylene',
    description: 'Impact-resistant polymer deck',
    detail:
      'Candidate molded deck inserts on structural frame; verify composition and local recovery with supplier.',
    caveat:
      'Material composition and recycled content claims require independent supplier testing and engineering validation.',
    price: 40,
  },
  {
    id: 'cork' as const,
    label: 'Cork composite',
    description: 'Natural fiber composite deck',
    detail:
      'Responsibly sourced cork wear layer on supported deck; verify binder and sourcing with supplier.',
    caveat:
      'Cork is an illustrative construction package, not the complete structural deck. Material composition, sourcing claims, and structural performance require independent supplier testing and engineering validation.',
    price: 100,
  },
] as const;

// ============================================================================
// CATALOG LOOKUPS
// ============================================================================

function getCatalogEntry<T extends { id: string }>(
  catalog: readonly T[],
  id: string
): T | undefined {
  return catalog.find(entry => entry.id === id);
}

// ============================================================================
// PRICING
// ============================================================================

const BASE_PRICE = 480;

export function priceFor(config: Configuration): number {
  const sizeEntry = getCatalogEntry(SIZES, config.size);
  const typeEntry = getCatalogEntry(TYPES, config.type);
  const coatingEntry = getCatalogEntry(COATINGS, config.coating);
  const materialEntry = getCatalogEntry(MATERIALS, config.material);

  if (!sizeEntry || !typeEntry || !coatingEntry || !materialEntry) {
    return BASE_PRICE;
  }

  return BASE_PRICE + sizeEntry.price + typeEntry.price + coatingEntry.price + materialEntry.price;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================================================
// SUMMARY & DISPLAY
// ============================================================================

export function summaryFor(config: Configuration): string {
  const sizeLabel = getCatalogEntry(SIZES, config.size)?.label ?? config.size;
  const typeLabel = getCatalogEntry(TYPES, config.type)?.label ?? config.type;
  const coatingLabel = getCatalogEntry(COATINGS, config.coating)?.label ?? config.coating;
  const colorLabel = getCatalogEntry(COLORS, config.color)?.label ?? config.color;
  const vehicleColorLabel =
    getCatalogEntry(VEHICLE_COLORS, config.vehicleColor)?.label ?? config.vehicleColor;
  const materialLabel = getCatalogEntry(MATERIALS, config.material)?.label ?? config.material;

  return `${sizeLabel} ${typeLabel} (${coatingLabel} coating) in ${colorLabel}, mounted on ${vehicleColorLabel} vehicle, ${materialLabel} deck`;
}

// ============================================================================
// SPECIFICATION DOCUMENT
// ============================================================================

export function buildSpecification(config: Configuration): {
  version: string;
  brand: string;
  vehicle: string;
  configuration: Configuration;
  selections: Record<string, string>;
  dimensions: { width: number; length: number; unit: 'cm' };
  price: number;
  designSystem: typeof PALETTE_SOURCE;
  finishes: { ramp: { hex: string; palette: string }; vehicle: { hex: string; palette: string } };
  notice: string;
} {
  const sizeEntry = getCatalogEntry(SIZES, config.size);
  const typeEntry = getCatalogEntry(TYPES, config.type);
  const coatingEntry = getCatalogEntry(COATINGS, config.coating);
  const colorEntry = getCatalogEntry(COLORS, config.color);
  const vehicleColorEntry = getCatalogEntry(VEHICLE_COLORS, config.vehicleColor);
  const materialEntry = getCatalogEntry(MATERIALS, config.material);

  return {
    version: '1.0',
    designSystem: PALETTE_SOURCE,
    finishes: {
      ramp: { hex: colorEntry!.hex, palette: colorEntry!.palette },
      vehicle: { hex: vehicleColorEntry!.hex, palette: vehicleColorEntry!.palette },
    },
    brand: 'AERTH',
    vehicle: 'Generic SUV reference',
    configuration: config,
    selections: {
      size: sizeEntry?.label ?? config.size,
      type: typeEntry?.label ?? config.type,
      coating: coatingEntry?.label ?? config.coating,
      color: colorEntry?.label ?? config.color,
      vehicleColor: vehicleColorEntry?.label ?? config.vehicleColor,
      material: materialEntry?.label ?? config.material,
    },
    dimensions: {
      width: sizeEntry?.width ?? 0,
      length: sizeEntry?.length ?? 0,
      unit: 'cm',
    },
    price: priceFor(config),
    notice:
      'This specification is a conceptual reference only and does not constitute a production safety specification, engineering document, or product certification. All material composition claims, sourcing assertions, and structural performance characteristics require independent third-party supplier testing and engineering validation before any commercial production or distribution.',
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

function isValidSize(value: unknown): value is Size {
  return value === 'small' || value === 'medium' || value === 'large';
}

function isValidType(value: unknown): value is Type {
  return value === 'retractable';
}

function isValidCoating(value: unknown): value is Coating {
  return value === 'ribbed' || value === 'cushioned' || value === 'cork';
}

function isValidColor(value: unknown): value is Color {
  return value === 'red' || value === 'blue' || value === 'yellow';
}

function isValidVehicleColor(value: unknown): value is VehicleColor {
  return value === 'sage' || value === 'chalk' || value === 'graphite' || value === 'teal';
}

function isValidMaterial(value: unknown): value is Material {
  return value === 'aluminum' || value === 'polypropylene' || value === 'cork';
}

export function isValidConfiguration(value: unknown): value is Configuration {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    isValidSize(obj.size) &&
    isValidType(obj.type) &&
    isValidCoating(obj.coating) &&
    isValidColor(obj.color) &&
    isValidVehicleColor(obj.vehicleColor) &&
    isValidMaterial(obj.material)
  );
}

// ============================================================================
// LEGACY MIGRATION
// ============================================================================

/**
 * Decodes and migrates legacy configurations (versions 0, unversioned, or v1 with old types).
 * Only called at read boundaries (loadConfiguration, configurationFromSearch).
 * Migrates type='ramp' or type='steps' to type='retractable', preserving all other fields.
 * New data with unknown versions or invalid structures returns null (caller falls back to DEFAULT).
 */
function decodeLegacyConfiguration(parsed: unknown): Configuration | null {
  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }

  const obj = parsed as Record<string, unknown>;

  // Validate all required fields exist
  if (
    !isValidSize(obj.size) ||
    !isValidCoating(obj.coating) ||
    !isValidColor(obj.color) ||
    !isValidVehicleColor(obj.vehicleColor) ||
    !isValidMaterial(obj.material)
  ) {
    return null;
  }

  // Accept any type value for migration purposes
  const type = obj.type;
  if (typeof type !== 'string' || !['ramp', 'steps', 'retractable'].includes(type)) {
    return null;
  }

  // Migrate old types to retractable
  const migratedType: Type = 'retractable';

  return {
    size: obj.size as Size,
    type: migratedType,
    coating: obj.coating as Coating,
    color: obj.color as Color,
    vehicleColor: obj.vehicleColor as VehicleColor,
    material: obj.material as Material,
  };
}

// One read boundary for URL and storage envelopes. New data never accepts retired types.
function decodeConfiguration(value: unknown): Configuration | null {
  if (!value || typeof value !== 'object') return null;
  if ('version' in value) {
    const envelope = value as { version: unknown; configuration?: unknown };
    if (envelope.version === 2)
      return isValidConfiguration(envelope.configuration) ? envelope.configuration : null;
    if (envelope.version === 1) return decodeLegacyConfiguration(envelope.configuration);
    return null;
  }
  return decodeLegacyConfiguration(value);
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEY = 'aerth_configuration' as const;

// ============================================================================
// PERSISTENCE
// ============================================================================

export function loadConfiguration(storage?: Pick<Storage, 'getItem'>): Configuration {
  try {
    const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : null);
    if (!store) return { ...DEFAULT_CONFIG };
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_CONFIG;
    }

    return decodeConfiguration(JSON.parse(raw)) ?? { ...DEFAULT_CONFIG };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfiguration(
  config: Configuration,
  storage?: Pick<Storage, 'setItem'>
): boolean {
  try {
    const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : null);
    if (!store) return false;
    if (!isValidConfiguration(config)) {
      return false;
    }

    // v2 only offers the integrated retractable ramp.
    const versionedData = { version: 2 as const, configuration: config };
    store.setItem(STORAGE_KEY, JSON.stringify(versionedData));
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// URL SERIALIZATION
// ============================================================================

export function buildUrl(config: Configuration, url: string): string {
  if (!isValidConfiguration(config)) throw new TypeError('A valid configuration is required.');
  const absolute = /^https?:\/\//i.test(url);
  const parsed = new URL(url, 'http://localhost');
  if (!['http:', 'https:'].includes(parsed.protocol))
    throw new TypeError('An HTTP application URL is required.');
  parsed.hash = '';
  parsed.searchParams.set('build', btoa(JSON.stringify({ version: 2, configuration: config })));
  return absolute ? parsed.toString() : parsed.pathname + parsed.search;
}

export function configurationFromSearch(search: string): Configuration | null {
  if (!search || typeof search !== 'string') {
    return null;
  }

  try {
    // Handle both ?build=... and build=... formats
    const cleanSearch = search.startsWith('?') ? search.slice(1) : search;
    const params = new URLSearchParams(cleanSearch);
    const buildParam = params.get('build');

    if (!buildParam) {
      return null;
    }

    return decodeConfiguration(JSON.parse(atob(buildParam)));
  } catch {
    return null;
  }
}

// ============================================================================
// EXPORTS SUMMARY
// ============================================================================

// All type exports: Configuration, Size, Type, Coating, Color, VehicleColor, Material
// All catalog exports: SIZES, TYPES, COATINGS, COLORS, VEHICLE_COLORS, MATERIALS
// All catalog entries use precise 'as const' IDs
// Pricing: priceFor(config), formatPrice(amount), BASE_PRICE = 480
// Display: summaryFor(config), buildSpecification(config)
// Validation: isValidConfiguration(config)
// Storage: loadConfiguration(storage?), saveConfiguration(config, storage?), STORAGE_KEY
// URL: buildUrl(config, url), configurationFromSearch(search)
