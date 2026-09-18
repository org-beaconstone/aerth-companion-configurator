/**
 * Material finish properties for product surfaces.
 * These define the physical appearance (roughness, metalness, reflectivity)
 * and are shared across 3D rendering and UI/fallback visualization.
 *
 * All colors are sRGB hex values. Roughness/metalness are Three.js standard.
 * envMapIntensity controls environment reflections; bumpScale controls normal detail.
 */

export const TREAD_SURFACES = {
  cushioned: {
    // Soft rubber with matte finish, dark charcoal
    roughness: 0.96,
    metalness: 0,
    envMapIntensity: 0.15,
    bumpScale: 0.0006,
    // UI fallback colors (sRGB hex)
    base: '#3E3E3E', // Dark charcoal base
    shadow: '#2A2A2A', // Darker shadow
    grain: '#555555', // Subtle stipple grain
  },
  cork: {
    // Matte natural cork, dark brown
    roughness: 0.94,
    metalness: 0,
    envMapIntensity: 0.12,
    bumpScale: 0.0005,
    // UI fallback colors (sRGB hex)
    base: '#6D5A3C', // Muted dark brown
    shadow: '#544730', // Darker brown shadow
    grain: '#7A6B52', // Granular texture
  },
  ribbed: {
    // Grooved rubber with darker tread
    roughness: 0.95,
    metalness: 0,
    envMapIntensity: 0.16,
    bumpScale: 0.0008,
    // UI fallback colors (sRGB hex)
    base: '#505258', // Neutral dark gray
    shadow: '#3B3D42', // Darker gray
    grain: '#7D818A', // Rib highlight
  },
} as const;

export type TreadSurfaceKey = keyof typeof TREAD_SURFACES;

export interface SurfaceFinish {
  readonly roughness: number;
  readonly metalness: number;
  readonly envMapIntensity: number;
  readonly bumpScale: number;
  readonly base: string;
  readonly shadow: string;
  readonly grain: string;
}

/**
 * Retrieve surface finish properties for a tread coating type.
 */
export function getTreadSurface(coating: TreadSurfaceKey): SurfaceFinish {
  return TREAD_SURFACES[coating];
}
