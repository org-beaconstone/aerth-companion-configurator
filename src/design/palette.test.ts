import { describe, expect, it } from 'vitest';
import palette from '@atlaskit/tokens/palette';
import { PRODUCT_PALETTE, SCENE_PALETTE, VEHICLE_FINISH } from './palette';
import { DEFAULT_CONFIG } from '../domain/configuration';

for (const [group, finishes] of Object.entries({
  product: PRODUCT_PALETTE,
  scene: SCENE_PALETTE,
})) {
  describe(`ADS ${group} finish provenance`, () => {
    for (const [name, finish] of Object.entries(finishes)) {
      it(`${name} matches the published ${finish.palette} color`, () => {
        const swatch = palette.find(entry => entry.name === `color.palette.${finish.palette}`);
        expect(String(swatch?.value).toUpperCase()).toBe(finish.hex);
      });
    }
  });
}

describe('accessory-first vehicle styling', () => {
  it('starts new builds in a soft neutral without changing ramp accents', () => {
    expect(DEFAULT_CONFIG.vehicleColor).toBe('chalk');
    expect(PRODUCT_PALETTE.chalk.palette).toBe('Neutral300');
    expect([PRODUCT_PALETTE.red.hex, PRODUCT_PALETTE.blue.hex, PRODUCT_PALETTE.yellow.hex]).toEqual(
      ['#C9372C', '#1868DB', '#EED12B']
    );
  });
  it('keeps all non-signal fixed materials neutral', () => {
    for (const [name, finish] of Object.entries(SCENE_PALETTE)) {
      if (name !== 'taillight') expect(finish.palette).toMatch(/^Neutral/);
    }
    expect(SCENE_PALETTE.interior.hex).toBe(SCENE_PALETTE.trim.hex);
  });
  it('keeps restrained paint reflections and softer trim', () => {
    expect(VEHICLE_FINISH.body.roughness).toBeGreaterThanOrEqual(0.25);
    expect(VEHICLE_FINISH.body.clearcoat).toBeGreaterThan(0.5);
    expect(VEHICLE_FINISH.trim.roughness).toBeGreaterThan(VEHICLE_FINISH.body.roughness);
    expect(VEHICLE_FINISH.hardware.metalness).toBeLessThanOrEqual(0.65);
  });
});
