import { describe, it, expect, vi } from 'vitest';
import {
  DEFAULT_CONFIG,
  buildUrl,
  configurationFromSearch,
  loadConfiguration,
  saveConfiguration,
} from './configuration';

describe('browser boundaries', () => {
  it('handles the localStorage property getter itself throwing', () => {
    const getter = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Blocked by browser', 'SecurityError');
    });
    try {
      expect(loadConfiguration()).toEqual(DEFAULT_CONFIG);
      expect(saveConfiguration(DEFAULT_CONFIG)).toBe(false);
    } finally {
      getter.mockRestore();
    }
  });
  it('writes versioned links and rejects unknown link versions', () => {
    const url = new URL(
      buildUrl(DEFAULT_CONFIG, 'https://example.test/studio/?campaign=keynote#view')
    );
    expect(url.origin).toBe('https://example.test');
    expect(url.pathname).toBe('/studio/');
    expect(url.searchParams.get('campaign')).toBe('keynote');
    expect(url.hash).toBe('');
    expect(JSON.parse(atob(url.searchParams.get('build')!))).toEqual({
      version: 2,
      configuration: DEFAULT_CONFIG,
    });
    url.searchParams.set(
      'build',
      btoa(JSON.stringify({ version: 99, configuration: DEFAULT_CONFIG }))
    );
    expect(configurationFromSearch(url.search)).toBeNull();
  });
  it('rejects non-web sharing protocols', () => {
    expect(() => buildUrl(DEFAULT_CONFIG, 'javascript:alert(1)')).toThrow(TypeError);
  });
});
