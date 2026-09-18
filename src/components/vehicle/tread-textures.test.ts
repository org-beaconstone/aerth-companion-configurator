import { describe, expect, it, vi } from 'vitest';
import { NoColorSpace, RepeatWrapping, SRGBColorSpace } from 'three';
import { createTreadMaps, generateTreadPixels, TEXTURE_SIZE, TILE_METERS } from './tread-textures';
import { TREAD_SURFACES } from '../../design/surfaces';

describe('matte tread textures', () => {
  it.each(['cushioned', 'cork'] as const)('%s has deterministic muted detail', coating => {
    const a = generateTreadPixels(coating),
      b = generateTreadPixels(coating);
    expect(a.color).toEqual(b.color);
    expect(a.height).toEqual(b.height);
    expect(a.color.length).toBe(TEXTURE_SIZE * TEXTURE_SIZE * 4);
    const red = [...a.color].filter((_, i) => i % 4 === 0);
    expect(new Set(red).size).toBeGreaterThan(12);
    expect(Math.max(...red)).toBeLessThan(coating === 'cork' ? 140 : 90);
    expect(TREAD_SURFACES[coating].metalness).toBe(0);
    expect(TREAD_SURFACES[coating].roughness).toBeGreaterThan(0.9);
  });
  it('uses different organic cork and rubber patterns', () => {
    expect(generateTreadPixels('cork').color).not.toEqual(generateTreadPixels('cushioned').color);
    expect(generateTreadPixels('cork').height).not.toEqual(generateTreadPixels('cushioned').height);
  });
  it('declares color space and physical repeats independently per tread', () => {
    const a = createTreadMaps('cork', 0.4, 0.6),
      b = createTreadMaps('cork', 0.6, 0.8);
    expect(a.color.colorSpace).toBe(SRGBColorSpace);
    expect(a.bump.colorSpace).toBe(NoColorSpace);
    expect(a.color.wrapS).toBe(RepeatWrapping);
    expect(a.color.repeat.x).toBeCloseTo(0.4 / TILE_METERS);
    expect(b.color.repeat.y).toBeCloseTo(0.8 / TILE_METERS);
    expect(a.color).not.toBe(b.color);
    expect(a.color.repeat.x).not.toBe(b.color.repeat.x);
    const disposeColor = vi.spyOn(a.color, 'dispose'),
      disposeBump = vi.spyOn(a.bump, 'dispose');
    a.dispose();
    expect(disposeColor).toHaveBeenCalledOnce();
    expect(disposeBump).toHaveBeenCalledOnce();
    b.dispose();
  });
  it('rejects invalid texture sizes and physical dimensions', () => {
    expect(() => generateTreadPixels('cork', 0)).toThrow(RangeError);
    expect(() => createTreadMaps('cork', NaN, 1)).toThrow(RangeError);
  });
});
