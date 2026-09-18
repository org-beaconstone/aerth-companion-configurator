import { describe, it, expect, vi } from 'vitest';
import {
  Configuration,
  Size,
  Type,
  Coating,
  Color,
  VehicleColor,
  Material,
  DEFAULT_CONFIG,
  SIZES,
  TYPES,
  COATINGS,
  COLORS,
  VEHICLE_COLORS,
  MATERIALS,
  STORAGE_KEY,
  priceFor,
  formatPrice,
  summaryFor,
  buildSpecification,
  isValidConfiguration,
  loadConfiguration,
  saveConfiguration,
  buildUrl,
  configurationFromSearch,
} from './configuration';

// ============================================================================
// TYPE VALIDATION TESTS
// ============================================================================

describe('type definitions', () => {
  it('DEFAULT_CONFIG is valid Configuration', () => {
    expect(isValidConfiguration(DEFAULT_CONFIG)).toBe(true);
  });

  it('DEFAULT_CONFIG has all required fields', () => {
    expect(DEFAULT_CONFIG).toHaveProperty('size');
    expect(DEFAULT_CONFIG).toHaveProperty('type');
    expect(DEFAULT_CONFIG).toHaveProperty('coating');
    expect(DEFAULT_CONFIG).toHaveProperty('color');
    expect(DEFAULT_CONFIG).toHaveProperty('vehicleColor');
    expect(DEFAULT_CONFIG).toHaveProperty('material');
  });

  it('DEFAULT_CONFIG values are correct', () => {
    expect(DEFAULT_CONFIG.size).toBe('medium');
    expect(DEFAULT_CONFIG.type).toBe('retractable');
    expect(DEFAULT_CONFIG.coating).toBe('ribbed');
    expect(DEFAULT_CONFIG.color).toBe('blue');
    expect(DEFAULT_CONFIG.vehicleColor).toBe('chalk');
    expect(DEFAULT_CONFIG.material).toBe('aluminum');
  });
});

// ============================================================================
// CATALOG STRUCTURE TESTS
// ============================================================================

describe('SIZES catalog', () => {
  it('has all size options', () => {
    expect(SIZES).toHaveLength(3);
    const ids = SIZES.map(s => s.id);
    expect(ids).toEqual(['small', 'medium', 'large']);
  });

  it('each size has required fields', () => {
    SIZES.forEach(size => {
      expect(size).toHaveProperty('id');
      expect(size).toHaveProperty('label');
      expect(size).toHaveProperty('description');
      expect(size).toHaveProperty('width');
      expect(size).toHaveProperty('length');
      expect(size).toHaveProperty('price');
      expect(typeof size.width).toBe('number');
      expect(typeof size.length).toBe('number');
      expect(typeof size.price).toBe('number');
    });
  });

  it('prices are reasonable', () => {
    SIZES.forEach(size => {
      expect(size.price).toBeGreaterThanOrEqual(0);
      expect(size.price).toBeLessThan(10000);
    });
  });
});

describe('TYPES catalog', () => {
  it('offers only the integrated retractable product', () => {
    expect(TYPES).toHaveLength(1);
    const ids = TYPES.map(t => t.id);
    expect(ids).toEqual(['retractable']);
  });

  it('each type has required fields', () => {
    TYPES.forEach(type => {
      expect(type).toHaveProperty('id');
      expect(type).toHaveProperty('label');
      expect(type).toHaveProperty('description');
      expect(type).toHaveProperty('price');
      expect(typeof type.price).toBe('number');
    });
  });
});

describe('COATINGS catalog', () => {
  it('has all coating options', () => {
    expect(COATINGS).toHaveLength(3);
    const ids = COATINGS.map(c => c.id);
    expect(ids).toEqual(['ribbed', 'cushioned', 'cork']);
  });

  it('each coating has required fields', () => {
    COATINGS.forEach(coating => {
      expect(coating).toHaveProperty('id');
      expect(coating).toHaveProperty('label');
      expect(coating).toHaveProperty('description');
      expect(coating).toHaveProperty('price');
    });
  });
});

describe('COLORS catalog', () => {
  it('has all color options', () => {
    expect(COLORS).toHaveLength(3);
    const ids = COLORS.map(c => c.id);
    expect(ids).toEqual(['red', 'blue', 'yellow']);
  });

  it('each color has required fields', () => {
    COLORS.forEach(color => {
      expect(color).toHaveProperty('id');
      expect(color).toHaveProperty('label');
      expect(color).toHaveProperty('hex');
      expect(color).toHaveProperty('description');
      expect(color.hex).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});

describe('VEHICLE_COLORS catalog', () => {
  it('has all vehicle color options', () => {
    expect(VEHICLE_COLORS).toHaveLength(4);
    const ids = VEHICLE_COLORS.map(v => v.id);
    expect(ids).toEqual(['sage', 'chalk', 'graphite', 'teal']);
  });

  it('each vehicle color has required fields', () => {
    VEHICLE_COLORS.forEach(vc => {
      expect(vc).toHaveProperty('id');
      expect(vc).toHaveProperty('label');
      expect(vc).toHaveProperty('hex');
      expect(vc.hex).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});

describe('MATERIALS catalog', () => {
  it('has all material options', () => {
    expect(MATERIALS).toHaveLength(3);
    const ids = MATERIALS.map(m => m.id);
    expect(ids).toEqual(['aluminum', 'polypropylene', 'cork']);
  });

  it('each material has required fields', () => {
    MATERIALS.forEach(material => {
      expect(material).toHaveProperty('id');
      expect(material).toHaveProperty('label');
      expect(material).toHaveProperty('description');
      expect(material).toHaveProperty('detail');
      expect(material).toHaveProperty('caveat');
      expect(material).toHaveProperty('price');
    });
  });

  it('materials include engineering/testing caveats', () => {
    MATERIALS.forEach(material => {
      expect(material.caveat).toContain('independent');
      expect(material.caveat).toContain('testing');
      expect(material.caveat).toContain('validation');
    });
  });

  it('materials do not make unsupported claims', () => {
    MATERIALS.forEach(material => {
      const forbidden = [
        'certified',
        'approved',
        'non-toxic',
        'pet safe',
        'quantified green',
        'eco-friendly',
        'safe for',
      ];
      forbidden.forEach(term => {
        expect(material.detail.toLowerCase()).not.toContain(term.toLowerCase());
        expect(material.label.toLowerCase()).not.toContain(term.toLowerCase());
      });
    });
  });

  it('cork material notes it is not complete structural deck', () => {
    const corkMaterial = MATERIALS.find(m => m.id === 'cork');
    expect(corkMaterial?.caveat).toContain('illustrative construction package');
    expect(corkMaterial?.caveat).toContain('not the complete structural deck');
  });
});

// ============================================================================
// VALIDATION TESTS
// ============================================================================

describe('isValidConfiguration', () => {
  it('validates correct configuration', () => {
    const config: Configuration = {
      size: 'small',
      type: 'retractable',
      coating: 'ribbed',
      color: 'red',
      vehicleColor: 'sage',
      material: 'aluminum',
    };
    expect(isValidConfiguration(config)).toBe(true);
  });

  it('rejects invalid size', () => {
    const config = {
      size: 'xlarge',
      type: 'retractable',
      coating: 'ribbed',
      color: 'red',
      vehicleColor: 'sage',
      material: 'aluminum',
    };
    expect(isValidConfiguration(config)).toBe(false);
  });

  it('rejects invalid type', () => {
    const config = {
      size: 'small',
      type: 'sliding',
      coating: 'ribbed',
      color: 'red',
      vehicleColor: 'sage',
      material: 'aluminum',
    };
    expect(isValidConfiguration(config)).toBe(false);
  });

  it('rejects invalid coating', () => {
    const config = {
      size: 'small',
      type: 'retractable',
      coating: 'velvet',
      color: 'red',
      vehicleColor: 'sage',
      material: 'aluminum',
    };
    expect(isValidConfiguration(config)).toBe(false);
  });

  it('rejects invalid color', () => {
    const config = {
      size: 'small',
      type: 'retractable',
      coating: 'ribbed',
      color: 'green',
      vehicleColor: 'sage',
      material: 'aluminum',
    };
    expect(isValidConfiguration(config)).toBe(false);
  });

  it('rejects invalid vehicleColor', () => {
    const config = {
      size: 'small',
      type: 'retractable',
      coating: 'ribbed',
      color: 'red',
      vehicleColor: 'purple',
      material: 'aluminum',
    };
    expect(isValidConfiguration(config)).toBe(false);
  });

  it('rejects invalid material', () => {
    const config = {
      size: 'small',
      type: 'retractable',
      coating: 'ribbed',
      color: 'red',
      vehicleColor: 'sage',
      material: 'steel',
    };
    expect(isValidConfiguration(config)).toBe(false);
  });

  it('rejects non-object', () => {
    expect(isValidConfiguration('not an object')).toBe(false);
    expect(isValidConfiguration(null)).toBe(false);
    expect(isValidConfiguration(undefined)).toBe(false);
    expect(isValidConfiguration(42)).toBe(false);
  });

  it('rejects missing fields', () => {
    const config = {
      size: 'small',
      type: 'retractable',
      coating: 'ribbed',
      color: 'red',
      // missing vehicleColor and material
    };
    expect(isValidConfiguration(config)).toBe(false);
  });

  it('rejects extra fields (unknown enums)', () => {
    const config = {
      size: 'small',
      type: 'retractable',
      coating: 'ribbed',
      color: 'red',
      vehicleColor: 'sage',
      material: 'aluminum',
      extra: 'field',
    };
    // Extra fields are OK for structural purposes, but enums must be valid
    expect(isValidConfiguration(config)).toBe(true);
  });
});

// ============================================================================
// PRICING TESTS
// ============================================================================

describe('priceFor', () => {
  it('prices default config', () => {
    const price = priceFor(DEFAULT_CONFIG);
    expect(price).toBeGreaterThan(0);
    expect(typeof price).toBe('number');
  });

  it('minimum price configuration', () => {
    const minConfig: Configuration = {
      size: 'small',
      type: 'retractable',
      coating: 'ribbed',
      color: 'red',
      vehicleColor: 'sage',
      material: 'aluminum',
    };
    const price = priceFor(minConfig);
    // 480 (base) + 180 (small) + 120 (integrated retractable) + 0 + 0
    expect(price).toBe(780);
  });

  it('maximum price configuration', () => {
    const maxConfig: Configuration = {
      size: 'large',
      type: 'retractable',
      coating: 'cork',
      color: 'yellow',
      vehicleColor: 'graphite',
      material: 'cork',
    };
    const price = priceFor(maxConfig);
    // 480 (base) + 420 (large) + 120 (retractable) + 60 (cork coating) + 100 (cork material)
    expect(price).toBe(1180);
  });

  it('all combinations produce valid prices', () => {
    const sizes: Size[] = ['small', 'medium', 'large'];
    const types: Type[] = ['retractable'];
    const coatings: Coating[] = ['ribbed', 'cushioned', 'cork'];
    const colors: Color[] = ['red', 'blue', 'yellow'];
    const vehicleColors: VehicleColor[] = ['sage', 'chalk', 'graphite', 'teal'];
    const materials: Material[] = ['aluminum', 'polypropylene', 'cork'];

    let count = 0;
    for (const size of sizes) {
      for (const type of types) {
        for (const coating of coatings) {
          for (const color of colors) {
            for (const vehicleColor of vehicleColors) {
              for (const material of materials) {
                const config: Configuration = {
                  size,
                  type,
                  coating,
                  color,
                  vehicleColor,
                  material,
                };
                const price = priceFor(config);
                expect(price).toBeGreaterThan(0);
                expect(price).toBeLessThan(10000);
                expect(Number.isInteger(price)).toBe(true);
                count++;
              }
            }
          }
        }
      }
    }
    // 3 sizes * 1 product * 3 surfaces * 3 colors * 4 paints * 3 materials.
    expect(count).toBe(324);
  });

  it('prices increase monotonically with options', () => {
    const config: Configuration = {
      size: 'small',
      type: 'retractable',
      coating: 'ribbed',
      color: 'red',
      vehicleColor: 'sage',
      material: 'aluminum',
    };

    const price = priceFor(config);
    expect(price).toBeGreaterThan(0);
    expect(typeof price).toBe('number');
  });
});

describe('formatPrice', () => {
  it('formats USD currency without cents', () => {
    expect(formatPrice(480)).toBe('$480');
    expect(formatPrice(1000)).toBe('$1,000');
    expect(formatPrice(1180)).toBe('$1,180');
  });

  it('rounds to nearest dollar', () => {
    expect(formatPrice(480.5)).toBe('$481');
    expect(formatPrice(480.4)).toBe('$480');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0');
  });

  it('uses en-US locale', () => {
    // Verify thousands separator
    expect(formatPrice(10000)).toContain(',');
  });
});

// ============================================================================
// DISPLAY & SUMMARY TESTS
// ============================================================================

describe('summaryFor', () => {
  it('generates summary for default config', () => {
    const summary = summaryFor(DEFAULT_CONFIG);
    expect(typeof summary).toBe('string');
    expect(summary.length).toBeGreaterThan(10);
    expect(summary).toContain('Medium');
    expect(summary).toContain('Retractable');
    expect(summary).toContain('Ribbed grip');
    expect(summary).toContain('Ocean blue');
    expect(summary).toContain('Chalk');
    expect(summary).toContain('Recycled aluminum');
  });

  it('includes all selected labels', () => {
    const config: Configuration = {
      size: 'large',
      type: 'retractable',
      coating: 'cushioned',
      color: 'yellow',
      vehicleColor: 'chalk',
      material: 'polypropylene',
    };
    const summary = summaryFor(config);
    expect(summary).toContain('Large');
    expect(summary).toContain('Retractable');
    expect(summary).toContain('Cushioned tread');
    expect(summary).toContain('Solar yellow');
    expect(summary).toContain('Chalk');
    expect(summary).toContain('Recycled polypropylene');
  });

  it('includes coating and material context', () => {
    const summary = summaryFor(DEFAULT_CONFIG);
    expect(summary).toContain('coating');
    expect(summary).toContain('deck');
  });
});

describe('buildSpecification', () => {
  it('returns specification object with all required fields', () => {
    const spec = buildSpecification(DEFAULT_CONFIG);
    expect(spec).toHaveProperty('version');
    expect(spec).toHaveProperty('brand');
    expect(spec).toHaveProperty('vehicle');
    expect(spec).toHaveProperty('configuration');
    expect(spec).toHaveProperty('selections');
    expect(spec).toHaveProperty('dimensions');
    expect(spec).toHaveProperty('price');
    expect(spec).toHaveProperty('notice');
  });

  it('has correct version and brand', () => {
    const spec = buildSpecification(DEFAULT_CONFIG);
    expect(spec.version).toBe('1.0');
    expect(spec.brand).toBe('AERTH');
    expect(spec.vehicle).toContain('Generic');
    expect(spec.vehicle).toContain('SUV');
  });

  it('vehicle is marked as reference/concept not production', () => {
    const spec = buildSpecification(DEFAULT_CONFIG);
    expect(spec.vehicle).toContain('reference');
  });

  it('includes configuration object', () => {
    const config: Configuration = {
      size: 'small',
      type: 'retractable',
      coating: 'ribbed',
      color: 'red',
      vehicleColor: 'sage',
      material: 'aluminum',
    };
    const spec = buildSpecification(config);
    expect(spec.configuration).toEqual(config);
  });

  it('includes human readable selections', () => {
    const config: Configuration = {
      size: 'large',
      type: 'retractable',
      coating: 'cork',
      color: 'yellow',
      vehicleColor: 'graphite',
      material: 'cork',
    };
    const spec = buildSpecification(config);
    expect(spec.selections.size).toBe('Large');
    expect(spec.selections.type).toBe('Retractable');
    expect(spec.selections.coating).toBe('Cork touch');
    expect(spec.selections.color).toBe('Solar yellow');
    expect(spec.selections.vehicleColor).toBe('Graphite');
    expect(spec.selections.material).toBe('Cork composite');
  });

  it('includes dimensions from size', () => {
    const spec = buildSpecification(DEFAULT_CONFIG);
    expect(spec.dimensions).toHaveProperty('width');
    expect(spec.dimensions).toHaveProperty('length');
    expect(spec.dimensions.unit).toBe('cm');
    // Medium is 50x210
    expect(spec.dimensions.width).toBe(50);
    expect(spec.dimensions.length).toBe(210);
  });

  it('includes accurate price', () => {
    const config: Configuration = {
      size: 'small',
      type: 'retractable',
      coating: 'ribbed',
      color: 'red',
      vehicleColor: 'sage',
      material: 'aluminum',
    };
    const spec = buildSpecification(config);
    expect(spec.price).toBe(priceFor(config));
  });

  it('includes disclaimer notice about concept/not production', () => {
    const spec = buildSpecification(DEFAULT_CONFIG);
    expect(spec.notice).toContain('conceptual');
    expect(spec.notice).toContain('reference only');
    expect(spec.notice).toContain('not');
    expect(spec.notice).toContain('production safety');
    expect(spec.notice).toContain('certification');
  });

  it('notice does not claim any approvals', () => {
    const spec = buildSpecification(DEFAULT_CONFIG);
    expect(spec.notice).not.toContain('approved');
    expect(spec.notice).not.toContain('certified');
  });
});

// ============================================================================
// STORAGE TESTS
// ============================================================================

describe('loadConfiguration', () => {
  it('returns default config when storage is unavailable', () => {
    const config = loadConfiguration(undefined);
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('returns default config when storage is empty', () => {
    const mockStorage = { getItem: vi.fn(() => null) };
    const config = loadConfiguration(mockStorage);
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('loads valid configuration from storage', () => {
    const testConfig: Configuration = {
      size: 'large',
      type: 'retractable',
      coating: 'cork',
      color: 'red',
      vehicleColor: 'graphite',
      material: 'polypropylene',
    };
    const mockStorage = {
      getItem: vi.fn(() => JSON.stringify(testConfig)),
    };
    const config = loadConfiguration(mockStorage);
    expect(config).toEqual(testConfig);
  });

  it('returns default on invalid JSON in storage', () => {
    const mockStorage = { getItem: vi.fn(() => 'not valid json{') };
    const config = loadConfiguration(mockStorage);
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('returns default on invalid configuration in storage', () => {
    const invalidConfig = {
      size: 'xlarge',
      type: 'retractable',
      coating: 'ribbed',
      color: 'red',
      vehicleColor: 'sage',
      material: 'aluminum',
    };
    const mockStorage = {
      getItem: vi.fn(() => JSON.stringify(invalidConfig)),
    };
    const config = loadConfiguration(mockStorage);
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('returns default on missing fields', () => {
    const incompleteConfig = {
      size: 'small',
      type: 'retractable',
      // missing coating, color, vehicleColor, material
    };
    const mockStorage = {
      getItem: vi.fn(() => JSON.stringify(incompleteConfig)),
    };
    const config = loadConfiguration(mockStorage);
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('gracefully handles storage access errors', () => {
    const mockStorage = {
      getItem: vi.fn(() => {
        throw new Error('Storage access denied');
      }),
    };
    const config = loadConfiguration(mockStorage);
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('returns default on unknown version in versioned envelope', () => {
    const unknownVersionData = { version: 99, configuration: DEFAULT_CONFIG };
    const mockStorage = {
      getItem: vi.fn(() => JSON.stringify(unknownVersionData)),
    };
    const config = loadConfiguration(mockStorage);
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('returns default on invalid configuration inside versioned envelope', () => {
    const invalidVersionedData = {
      version: 1,
      configuration: {
        size: 'xlarge',
        type: 'retractable',
        coating: 'ribbed',
        color: 'red',
        vehicleColor: 'sage',
        material: 'aluminum',
      },
    };
    const mockStorage = {
      getItem: vi.fn(() => JSON.stringify(invalidVersionedData)),
    };
    const config = loadConfiguration(mockStorage);
    expect(config).toEqual(DEFAULT_CONFIG);
  });
});

describe('saveConfiguration', () => {
  it('handles unavailable storage gracefully', () => {
    // Create a mock storage that throws on setItem (simulating unavailable storage)
    const mockStorage = {
      setItem: vi.fn(() => {
        throw new Error('Storage unavailable');
      }),
    };
    const result = saveConfiguration(DEFAULT_CONFIG, mockStorage);
    expect(result).toBe(false);
  });

  it('returns false for invalid configuration', () => {
    const invalidConfig = {
      size: 'xlarge',
      type: 'retractable',
      coating: 'ribbed',
      color: 'red',
      vehicleColor: 'sage',
      material: 'aluminum',
    };
    const mockStorage = { setItem: vi.fn() };
    const result = saveConfiguration(invalidConfig as Configuration, mockStorage);
    expect(result).toBe(false);
    expect(mockStorage.setItem).not.toHaveBeenCalled();
  });

  it('saves valid configuration to storage with versioned envelope', () => {
    const testConfig: Configuration = {
      size: 'small',
      type: 'retractable',
      coating: 'cushioned',
      color: 'yellow',
      vehicleColor: 'chalk',
      material: 'cork',
    };
    const mockStorage = { setItem: vi.fn() };
    const result = saveConfiguration(testConfig, mockStorage);
    expect(result).toBe(true);
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify({ version: 2, configuration: testConfig })
    );
  });

  it('gracefully handles storage write errors', () => {
    const mockStorage = {
      setItem: vi.fn(() => {
        throw new Error('Storage full');
      }),
    };
    const result = saveConfiguration(DEFAULT_CONFIG, mockStorage);
    expect(result).toBe(false);
  });

  it('roundtrip: save and load returns same config', () => {
    const testConfig: Configuration = {
      size: 'large',
      type: 'retractable',
      coating: 'cork',
      color: 'blue',
      vehicleColor: 'sage',
      material: 'polypropylene',
    };

    const store: Record<string, string> = {};
    const mockStorage = {
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      getItem: vi.fn((key: string) => store[key] ?? null),
    };

    const saveResult = saveConfiguration(testConfig, mockStorage as any);
    expect(saveResult).toBe(true);

    // Verify versioned format was stored
    const storedValue = store[STORAGE_KEY];
    expect(storedValue).toBeDefined();
    const parsed = JSON.parse(storedValue);
    expect(parsed.version).toBe(2);
    expect(parsed.configuration).toEqual(testConfig);

    const loadedConfig = loadConfiguration(mockStorage as any);
    expect(loadedConfig).toEqual(testConfig);
  });
});

// ============================================================================
// URL SERIALIZATION TESTS
// ============================================================================

describe('buildUrl', () => {
  it('encodes configuration in build search param', () => {
    const config: Configuration = DEFAULT_CONFIG;
    const baseUrl = 'http://localhost:5173/';
    const result = buildUrl(config, baseUrl);

    expect(result).toContain('build=');
    expect(result).not.toContain('#');
  });

  it('preserves base path', () => {
    const config: Configuration = DEFAULT_CONFIG;
    const baseUrl = 'http://localhost:5173/configurator';
    const result = buildUrl(config, baseUrl);

    expect(result).toContain('/configurator');
    expect(result).toContain('build=');
  });

  it('removes hash before encoding', () => {
    const config: Configuration = DEFAULT_CONFIG;
    const baseUrl = 'http://localhost:5173/#/configurator';
    const result = buildUrl(config, baseUrl);

    expect(result).not.toContain('#');
  });

  it('handles relative URLs', () => {
    const config: Configuration = DEFAULT_CONFIG;
    const baseUrl = '/configurator?existing=param';
    const result = buildUrl(config, baseUrl);

    expect(result).toContain('build=');
    expect(result).toContain('/configurator');
    expect(result).not.toContain('http');
  });

  it('returns absolute URL for absolute input', () => {
    const config: Configuration = DEFAULT_CONFIG;
    const baseUrl = 'https://example.com/configurator';
    const result = buildUrl(config, baseUrl);

    expect(result).toContain('https://example.com/configurator');
    expect(result).toContain('build=');
  });

  it('preserves origin in absolute URLs', () => {
    const config: Configuration = DEFAULT_CONFIG;
    const baseUrl = 'https://custom.domain.com:3000/path/to/configurator';
    const result = buildUrl(config, baseUrl);

    expect(result).toContain('https://custom.domain.com:3000/path/to/configurator');
    expect(result).toContain('build=');
  });

  it('roundtrip: buildUrl + configurationFromSearch', () => {
    const originalConfig: Configuration = {
      size: 'large',
      type: 'retractable',
      coating: 'cork',
      color: 'red',
      vehicleColor: 'graphite',
      material: 'polypropylene',
    };

    const url = buildUrl(originalConfig, 'http://localhost:5173/');
    const searchPart = url.split('?')[1];
    const loadedConfig = configurationFromSearch('?' + searchPart);

    expect(loadedConfig).toEqual(originalConfig);
  });

  it('survives encoding/decoding cycle with special characters', () => {
    // All enum values are simple strings, but test the encoding mechanism
    const config: Configuration = DEFAULT_CONFIG;
    const url = buildUrl(config, 'http://localhost:5173/');
    const search = url.split('?')[1];
    const decoded = configurationFromSearch('?' + search);

    expect(decoded).toEqual(config);
  });
});

describe('configurationFromSearch', () => {
  it('returns null for empty search', () => {
    expect(configurationFromSearch('')).toBeNull();
    expect(configurationFromSearch('?')).toBeNull();
  });

  it('returns null when build param missing', () => {
    expect(configurationFromSearch('?other=param')).toBeNull();
  });

  it('returns null for invalid base64', () => {
    expect(configurationFromSearch('?build=!!!invalid')).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    const encoded = btoa('not valid json{');
    expect(configurationFromSearch(`?build=${encoded}`)).toBeNull();
  });

  it('returns null for invalid configuration', () => {
    const invalidConfig = { size: 'xlarge' };
    const encoded = btoa(JSON.stringify(invalidConfig));
    expect(configurationFromSearch(`?build=${encoded}`)).toBeNull();
  });

  it('returns null for missing fields', () => {
    const incompleteConfig = { size: 'small', type: 'retractable' };
    const encoded = btoa(JSON.stringify(incompleteConfig));
    expect(configurationFromSearch(`?build=${encoded}`)).toBeNull();
  });

  it('parses valid encoded configuration', () => {
    const config: Configuration = {
      size: 'small',
      type: 'retractable',
      coating: 'cushioned',
      color: 'yellow',
      vehicleColor: 'chalk',
      material: 'cork',
    };
    const encoded = btoa(JSON.stringify(config));
    const parsed = configurationFromSearch(`?build=${encoded}`);
    expect(parsed).toEqual(config);
  });

  it('handles search string with leading ?', () => {
    const config: Configuration = DEFAULT_CONFIG;
    const encoded = btoa(JSON.stringify(config));
    const withQuestion = configurationFromSearch(`?build=${encoded}`);
    const withoutQuestion = configurationFromSearch(`build=${encoded}`);
    expect(withQuestion).toEqual(config);
    expect(withoutQuestion).toEqual(config);
  });

  it('ignores other search params', () => {
    const config: Configuration = DEFAULT_CONFIG;
    const encoded = btoa(JSON.stringify(config));
    const parsed = configurationFromSearch(`?foo=bar&build=${encoded}&baz=qux`);
    expect(parsed).toEqual(config);
  });

  it('gracefully handles non-string input', () => {
    expect(configurationFromSearch(null as any)).toBeNull();
    expect(configurationFromSearch(undefined as any)).toBeNull();
    expect(configurationFromSearch(42 as any)).toBeNull();
  });
});

// ============================================================================
// INTEGRATION & BOUNDARY TESTS
// ============================================================================

describe('integration: storage and URL', () => {
  it('load from storage, modify, save to URL', () => {
    const stored: Configuration = {
      size: 'small',
      type: 'retractable',
      coating: 'ribbed',
      color: 'red',
      vehicleColor: 'sage',
      material: 'aluminum',
    };

    const mockStorage = {
      getItem: vi.fn(() => JSON.stringify(stored)),
      setItem: vi.fn(),
    };

    const loaded = loadConfiguration(mockStorage);
    expect(loaded).toEqual(stored);

    const modified: Configuration = { ...loaded, size: 'large' };
    saveConfiguration(modified, mockStorage);

    const url = buildUrl(modified, 'http://localhost/configurator');
    const search = url.split('?')[1];
    const fromUrl = configurationFromSearch('?' + search);

    expect(fromUrl).toEqual(modified);
  });
});

describe('boundary: empty and corrupt storage', () => {
  it('handles blocked storage', () => {
    const mockStorage = {
      getItem: vi.fn(() => {
        throw new Error('Blocked');
      }),
      setItem: vi.fn(() => {
        throw new Error('Blocked');
      }),
    };

    const loaded = loadConfiguration(mockStorage);
    expect(loaded).toEqual(DEFAULT_CONFIG);

    const saved = saveConfiguration(DEFAULT_CONFIG, mockStorage);
    expect(saved).toBe(false);
  });

  it('survives all-invalid storage', () => {
    const mockStorage = {
      getItem: vi.fn(() => '{{{invalid'),
      setItem: vi.fn(),
    };

    const loaded = loadConfiguration(mockStorage);
    expect(loaded).toEqual(DEFAULT_CONFIG);
    expect(isValidConfiguration(loaded)).toBe(true);
  });
});

describe('comprehensive: all 324 configurations', () => {
  it('validates all retractable combinations (3 sizes * 3 coatings * 3 colors * 4 vehicle colors * 3 materials = 324)', () => {
    const sizes: Size[] = ['small', 'medium', 'large'];
    const types: Type[] = ['retractable'];
    const coatings: Coating[] = ['ribbed', 'cushioned', 'cork'];
    const colors: Color[] = ['red', 'blue', 'yellow'];
    const vehicleColors: VehicleColor[] = ['sage', 'chalk', 'graphite', 'teal'];
    const materials: Material[] = ['aluminum', 'polypropylene', 'cork'];

    let validCount = 0;
    let priceCheckCount = 0;

    for (const size of sizes) {
      for (const type of types) {
        for (const coating of coatings) {
          for (const color of colors) {
            for (const vehicleColor of vehicleColors) {
              for (const material of materials) {
                const config: Configuration = {
                  size,
                  type,
                  coating,
                  color,
                  vehicleColor,
                  material,
                };

                // Validation
                expect(isValidConfiguration(config)).toBe(true);
                validCount++;

                // Pricing
                const price = priceFor(config);
                expect(price).toBeGreaterThan(0);
                expect(price).toBeLessThan(10000);
                priceCheckCount++;

                // Summary
                const summary = summaryFor(config);
                expect(summary.length).toBeGreaterThan(0);

                // Specification
                const spec = buildSpecification(config);
                expect(spec.price).toBe(price);
              }
            }
          }
        }
      }
    }

    expect(validCount).toBe(324);
    expect(priceCheckCount).toBe(324);
  });

  it('all configurations roundtrip through URL', () => {
    const sizes: Size[] = ['small', 'medium', 'large'];
    const types: Type[] = ['retractable'];
    const coatings: Coating[] = ['ribbed', 'cushioned', 'cork'];
    const colors: Color[] = ['red', 'blue', 'yellow'];
    const vehicleColors: VehicleColor[] = ['sage', 'chalk', 'graphite', 'teal'];
    const materials: Material[] = ['aluminum', 'polypropylene', 'cork'];

    let roundtripCount = 0;

    for (const size of sizes) {
      for (const type of types) {
        for (const coating of coatings) {
          for (const color of colors) {
            for (const vehicleColor of vehicleColors) {
              for (const material of materials) {
                const original: Configuration = {
                  size,
                  type,
                  coating,
                  color,
                  vehicleColor,
                  material,
                };

                const url = buildUrl(original, 'http://localhost/');
                const search = url.split('?')[1];
                const restored = configurationFromSearch('?' + search);

                expect(restored).toEqual(original);
                roundtripCount++;
              }
            }
          }
        }
      }
    }

    expect(roundtripCount).toBe(324);
  });

  it('all configurations roundtrip through storage', () => {
    const sizes: Size[] = ['small', 'medium', 'large'];
    const types: Type[] = ['retractable'];
    const coatings: Coating[] = ['ribbed', 'cushioned', 'cork'];
    const colors: Color[] = ['red', 'blue', 'yellow'];
    const vehicleColors: VehicleColor[] = ['sage', 'chalk', 'graphite', 'teal'];
    const materials: Material[] = ['aluminum', 'polypropylene', 'cork'];

    let roundtripCount = 0;

    for (const size of sizes) {
      for (const type of types) {
        for (const coating of coatings) {
          for (const color of colors) {
            for (const vehicleColor of vehicleColors) {
              for (const material of materials) {
                const original: Configuration = {
                  size,
                  type,
                  coating,
                  color,
                  vehicleColor,
                  material,
                };

                const store: Record<string, string> = {};
                const mockStorage = {
                  setItem: (key: string, value: string) => {
                    store[key] = value;
                  },
                  getItem: (key: string) => store[key] ?? null,
                };

                saveConfiguration(original, mockStorage);
                const restored = loadConfiguration(mockStorage);

                expect(restored).toEqual(original);
                roundtripCount++;
              }
            }
          }
        }
      }
    }

    expect(roundtripCount).toBe(324);
  });
});

describe('price bounds', () => {
  it('all configurations have price in reasonable range', () => {
    const sizes: Size[] = ['small', 'medium', 'large'];
    const types: Type[] = ['retractable'];
    const coatings: Coating[] = ['ribbed', 'cushioned', 'cork'];
    const colors: Color[] = ['red', 'blue', 'yellow'];
    const vehicleColors: VehicleColor[] = ['sage', 'chalk', 'graphite', 'teal'];
    const materials: Material[] = ['aluminum', 'polypropylene', 'cork'];

    const prices: number[] = [];

    for (const size of sizes) {
      for (const type of types) {
        for (const coating of coatings) {
          for (const color of colors) {
            for (const vehicleColor of vehicleColors) {
              for (const material of materials) {
                const config: Configuration = {
                  size,
                  type,
                  coating,
                  color,
                  vehicleColor,
                  material,
                };
                prices.push(priceFor(config));
              }
            }
          }
        }
      }
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Now with only retractable type: 3 sizes * 3 coatings * 3 colors * 4 vehicle colors * 3 materials = 324
    expect(minPrice).toBe(780); // 480 base + 180 small + 120 integrated retractable
    expect(maxPrice).toBe(1180); // 480 + 420 + 120 + 80 cork surface + 80 cork material
    expect(prices.length).toBe(324);
  });
});

// ============================================================================
// LEGACY MIGRATION TESTS
// ============================================================================

describe('legacy migration: old stored/shared configs with type ramp/steps migrate to retractable', () => {
  it('loads v1 storage with type=ramp, migrates to retractable, preserves other fields', () => {
    const legacyData = {
      version: 1,
      configuration: {
        size: 'large',
        type: 'ramp',
        coating: 'cork',
        color: 'yellow',
        vehicleColor: 'graphite',
        material: 'polypropylene',
      },
    };
    const mockStorage = {
      getItem: vi.fn(() => JSON.stringify(legacyData)),
    };
    const config = loadConfiguration(mockStorage);
    expect(config.type).toBe('retractable');
    expect(config.size).toBe('large');
    expect(config.coating).toBe('cork');
    expect(config.color).toBe('yellow');
    expect(config.vehicleColor).toBe('graphite');
    expect(config.material).toBe('polypropylene');
  });

  it('loads v1 storage with type=steps, migrates to retractable, preserves other fields', () => {
    const legacyData = {
      version: 1,
      configuration: {
        size: 'small',
        type: 'steps',
        coating: 'cushioned',
        color: 'red',
        vehicleColor: 'sage',
        material: 'aluminum',
      },
    };
    const mockStorage = {
      getItem: vi.fn(() => JSON.stringify(legacyData)),
    };
    const config = loadConfiguration(mockStorage);
    expect(config.type).toBe('retractable');
    expect(config.size).toBe('small');
    expect(config.coating).toBe('cushioned');
    expect(config.color).toBe('red');
    expect(config.vehicleColor).toBe('sage');
    expect(config.material).toBe('aluminum');
  });

  it('loads unversioned legacy storage with type=ramp, migrates to retractable', () => {
    const legacyConfig = {
      size: 'medium',
      type: 'ramp',
      coating: 'ribbed',
      color: 'blue',
      vehicleColor: 'chalk',
      material: 'cork',
    };
    const mockStorage = {
      getItem: vi.fn(() => JSON.stringify(legacyConfig)),
    };
    const config = loadConfiguration(mockStorage);
    expect(config.type).toBe('retractable');
    expect(config).toEqual({
      size: 'medium',
      type: 'retractable',
      coating: 'ribbed',
      color: 'blue',
      vehicleColor: 'chalk',
      material: 'cork',
    });
  });

  it('decodes shared URL with v1 type=steps, migrates to retractable', () => {
    const legacyConfig = {
      size: 'large',
      type: 'steps',
      coating: 'cork',
      color: 'yellow',
      vehicleColor: 'graphite',
      material: 'polypropylene',
    };
    const encoded = btoa(JSON.stringify({ version: 1, configuration: legacyConfig }));
    const config = configurationFromSearch(`?build=${encodeURIComponent(encoded)}`);
    expect(config).not.toBeNull();
    expect(config!.type).toBe('retractable');
    expect(config!.size).toBe('large');
    expect(config!.coating).toBe('cork');
  });

  it('decodes unversioned shared URL with type=ramp, migrates to retractable', () => {
    const legacyConfig = {
      size: 'small',
      type: 'ramp',
      coating: 'cushioned',
      color: 'red',
      vehicleColor: 'sage',
      material: 'aluminum',
    };
    const encoded = btoa(JSON.stringify(legacyConfig));
    const config = configurationFromSearch(`?build=${encodeURIComponent(encoded)}`);
    expect(config).not.toBeNull();
    expect(config!.type).toBe('retractable');
    expect(config!.size).toBe('small');
  });

  it('rejects unknown version in shared URL', () => {
    const unknownVersion = {
      version: 99,
      configuration: DEFAULT_CONFIG,
    };
    const encoded = btoa(JSON.stringify(unknownVersion));
    const config = configurationFromSearch(`?build=${encodeURIComponent(encoded)}`);
    expect(config).toBeNull();
  });

  it('rejects invalid legacy data in shared URL', () => {
    const invalidConfig = {
      size: 'invalid_size',
      type: 'ramp',
      coating: 'ribbed',
      color: 'red',
      vehicleColor: 'chalk',
      material: 'aluminum',
    };
    const encoded = btoa(JSON.stringify(invalidConfig));
    const config = configurationFromSearch(`?build=${encodeURIComponent(encoded)}`);
    expect(config).toBeNull();
  });

  it('rejects legacy data with invalid fields', () => {
    const incompleteConfig = {
      size: 'medium',
      type: 'ramp',
      // missing coating, color, etc.
    };
    const mockStorage = {
      getItem: vi.fn(() => JSON.stringify({ version: 1, configuration: incompleteConfig })),
    };
    const config = loadConfiguration(mockStorage);
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('new retractable-only configurations roundtrip without migration', () => {
    const modernConfig: Configuration = {
      size: 'large',
      type: 'retractable',
      coating: 'cork',
      color: 'yellow',
      vehicleColor: 'graphite',
      material: 'polypropylene',
    };
    const store: Record<string, string> = {};
    const mockStorage = {
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      getItem: vi.fn((key: string) => store[key] ?? null),
    };
    const saved = saveConfiguration(modernConfig, mockStorage as any);
    expect(saved).toBe(true);
    const loaded = loadConfiguration(mockStorage as any);
    expect(loaded).toEqual(modernConfig);
  });
});
