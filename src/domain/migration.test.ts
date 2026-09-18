import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CONFIG,
  buildUrl,
  configurationFromSearch,
  isValidConfiguration,
  loadConfiguration,
  saveConfiguration,
} from './configuration';

const selections = {
  ...DEFAULT_CONFIG,
  size: 'large',
  coating: 'cork',
  color: 'yellow',
  vehicleColor: 'graphite',
  material: 'polypropylene',
} as const;
const search = (value: unknown) => '?build=' + encodeURIComponent(btoa(JSON.stringify(value)));

describe('retractable-only read boundaries', () => {
  for (const type of ['ramp', 'steps']) {
    for (const version of [undefined, 1]) {
      it(`migrates ${type} from ${version ?? 'unversioned'} storage and URLs without losing selections`, () => {
        const old = { ...selections, type };
        const envelope = version ? { version, configuration: old } : old;
        expect(loadConfiguration({ getItem: () => JSON.stringify(envelope) })).toEqual(selections);
        expect(configurationFromSearch(search(envelope))).toEqual(selections);
      });
    }
    it(`rejects retired ${type} in current data instead of reviving it`, () => {
      const invalid = { ...selections, type };
      expect(isValidConfiguration(invalid)).toBe(false);
      expect(configurationFromSearch(search({ version: 2, configuration: invalid }))).toBeNull();
      expect(
        loadConfiguration({ getItem: () => JSON.stringify({ version: 2, configuration: invalid }) })
      ).toEqual(DEFAULT_CONFIG);
    });
  }
  it('writes version two and preserves the fixed product in exports', () => {
    let saved = '';
    expect(
      saveConfiguration(selections, {
        setItem: (_key, value) => {
          saved = value;
        },
      })
    ).toBe(true);
    expect(JSON.parse(saved)).toEqual({ version: 2, configuration: selections });
    expect(
      configurationFromSearch(new URL(buildUrl(selections, 'https://example.test/')).search)
    ).toEqual(selections);
  });
});
