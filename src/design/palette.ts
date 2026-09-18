/**
 * Fixed product finishes from @atlaskit/tokens 18.2.0's public ADS palette.
 * UI colors use semantic tokens; WebGL needs literal sRGB values. These stay
 * constant across UI themes and are illustrative, not manufactured paint specs.
 * The regression test checks every value against the installed ADS palette.
 */
export const PRODUCT_PALETTE = {
  red: { hex: '#C9372C', palette: 'Red700', foreground: '#FFFFFF' },
  blue: { hex: '#1868DB', palette: 'Blue700', foreground: '#FFFFFF' },
  yellow: { hex: '#EED12B', palette: 'Yellow300', foreground: '#292A2E' },
  sage: { hex: '#216E4E', palette: 'Green800', foreground: '#FFFFFF' },
  chalk: { hex: '#DDDEE1', palette: 'Neutral300', foreground: '#292A2E' },
  graphite: { hex: '#505258', palette: 'Neutral800', foreground: '#FFFFFF' },
  teal: { hex: '#206A83', palette: 'Teal800', foreground: '#FFFFFF' },
} as const;

/** Quiet, closely related neutrals keep the vehicle secondary to the ramp. */
export const SCENE_PALETTE = {
  trim: { hex: '#7D818A', palette: 'Neutral600' },
  interior: { hex: '#7D818A', palette: 'Neutral600' },
  cargoMat: { hex: '#8C8F97', palette: 'Neutral500' },
  glass: { hex: '#6B6E76', palette: 'Neutral700' },
  chassis: { hex: '#505258', palette: 'Neutral800' },
  tire: { hex: '#3B3D42', palette: 'Neutral900' },
  tireTread: { hex: '#505258', palette: 'Neutral800' },
  wheel: { hex: '#8C8F97', palette: 'Neutral500' },
  seam: { hex: '#8C8F97', palette: 'Neutral500' },
  hardware: { hex: '#8C8F97', palette: 'Neutral500' },
  headlight: { hex: '#DDDEE1', palette: 'Neutral300' },
  taillight: { hex: '#5D1F1A', palette: 'Red900' },
  rampTread: { hex: '#505258', palette: 'Neutral800' },
  rampCushion: { hex: '#6B6E76', palette: 'Neutral700' },
  rampTexture: { hex: '#7D818A', palette: 'Neutral600' },
  rampSupport: { hex: '#7D818A', palette: 'Neutral600' },
  studioWhite: { hex: '#FFFFFF', palette: 'Neutral0' },
  studioGround: { hex: '#B7B9BE', palette: 'Neutral400' },
} as const;

/** Subtle automotive clearcoat reveals curvature; neutral trim remains quiet. */
export const VEHICLE_FINISH = {
  body: { metalness: 0.28, roughness: 0.32, clearcoat: 0.72, clearcoatRoughness: 0.2 },
  trim: { metalness: 0.03, roughness: 0.78, clearcoat: 0.08, clearcoatRoughness: 0.55 },
  glass: { metalness: 0.22, roughness: 0.13, clearcoat: 1, clearcoatRoughness: 0.08 },
  hardware: { metalness: 0.55, roughness: 0.38, clearcoat: 0.16, clearcoatRoughness: 0.3 },
} as const;

export const PALETTE_SOURCE = {
  system: 'Atlassian Design System',
  package: '@atlaskit/tokens',
  paletteVersion: '18.2.0',
  usage: 'Fixed product visualization colors; UI uses semantic ADS tokens.',
} as const;
