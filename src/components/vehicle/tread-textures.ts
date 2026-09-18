import {
  DataTexture,
  RGBAFormat,
  RepeatWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
  NoColorSpace,
} from 'three';
import { TREAD_SURFACES } from '../../design/surfaces';

export type TexturedCoating = 'cushioned' | 'cork';
export const TILE_METERS = 0.18;
export const TEXTURE_SIZE = 128;

function hash(x: number, y: number, seed = 19): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ seed;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
const wrap = (n: number, size: number) => ((n % size) + size) % size;
function grain(u: number, v: number, cells: number) {
  const x = u * cells,
    y = v * cells,
    ix = Math.floor(x),
    iy = Math.floor(y);
  let nearest = Infinity,
    second = Infinity,
    cell = 0;
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) {
      const xx = wrap(ix + dx, cells),
        yy = wrap(iy + dy, cells);
      const px = ix + dx + 0.16 + hash(xx, yy, 21) * 0.68,
        py = iy + dy + 0.16 + hash(xx, yy, 41) * 0.68;
      const distance = (x - px) ** 2 + (y - py) ** 2;
      if (distance < nearest) {
        second = nearest;
        nearest = distance;
        cell = hash(xx, yy, 77);
      } else second = Math.min(second, distance);
    }
  return { cell, edge: Math.min(1, (Math.sqrt(second) - Math.sqrt(nearest)) * 7) };
}
export function generateTreadPixels(coating: TexturedCoating, size = TEXTURE_SIZE) {
  if (!Number.isInteger(size) || size < 8 || size > 512)
    throw new RangeError('Texture size must be an integer between 8 and 512.');
  const color = new Uint8Array(size * size * 4),
    height = new Uint8Array(size * size * 4);
  const hex = TREAD_SURFACES[coating].base.slice(1);
  const base = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const noise = hash(x, y, 91),
        pore = hash(x, y, 171);
      const cork = coating === 'cork' ? grain(x / size, y / size, 22) : null;
      const variation = cork
        ? (cork.cell - 0.5) * 25 + (noise - 0.5) * 7 - (1 - cork.edge) * 7
        : (noise - 0.5) * 10 - (pore > 0.93 ? 7 : 0);
      const index = (y * size + x) * 4;
      for (let c = 0; c < 3; c++) {
        color[index + c] = Math.round(Math.max(0, Math.min(255, base[c] + variation)));
        height[index + c] = Math.round(
          cork ? 90 + cork.cell * 85 + cork.edge * 25 : 115 + noise * 30
        );
      }
      color[index + 3] = 255;
      height[index + 3] = 255;
    }
  return { color, height, size };
}

/** Each tread owns its GPU textures. No shared mutable repeat values or disposed cache. */
export function createTreadMaps(coating: TexturedCoating, width: number, length: number) {
  if (!(width > 0 && length > 0 && Number.isFinite(width) && Number.isFinite(length)))
    throw new RangeError('Tread dimensions must be finite and positive.');
  const pixels = generateTreadPixels(coating);
  const color = new DataTexture(pixels.color, pixels.size, pixels.size, RGBAFormat);
  const bump = new DataTexture(pixels.height, pixels.size, pixels.size, RGBAFormat);
  color.colorSpace = SRGBColorSpace;
  bump.colorSpace = NoColorSpace;
  for (const texture of [color, bump]) {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.repeat.set(width / TILE_METERS, length / TILE_METERS);
    texture.needsUpdate = true;
  }
  return {
    color,
    bump,
    dispose: () => {
      color.dispose();
      bump.dispose();
    },
  };
}
