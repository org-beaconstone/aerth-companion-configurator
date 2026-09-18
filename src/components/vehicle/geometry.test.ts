import { describe, expect, it } from 'vitest';
import { DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import {
  BODY,
  bodyTop,
  bodyWidth,
  cabinWidth,
  makeHood,
  hoodPoint,
  makeRoof,
  roofPoint,
  makeCowl,
  makeSidePanel,
  makeSideWindow,
  makeCabinSide,
  makeWindshield,
  windshieldPoint,
  makeShoulder,
  makeNose,
} from './geometry';

function hits(
  geometry: ReturnType<typeof makeHood>,
  origin: [number, number, number],
  direction: [number, number, number]
) {
  const material = new MeshBasicMaterial({ side: DoubleSide }),
    mesh = new Mesh(geometry, material);
  mesh.updateMatrixWorld();
  const result =
    new Raycaster(new Vector3(...origin), new Vector3(...direction).normalize()).intersectObject(
      mesh
    ).length > 0;
  material.dispose();
  return result;
}
describe('sealed sculpted body', () => {
  it('retains side contours and cabin taper', () => {
    expect(bodyWidth(0, 1.25)).toBeGreaterThan(bodyWidth(0, 0.52));
    expect(cabinWidth(1.95)).toBeLessThan(cabinWidth(1.43));
  });
  it.each([-1, 1])('shares hood and side boundary on side %s', sign => {
    for (let i = 0; i <= 100; i++) {
      const z = BODY.front + (i / 100) * (BODY.cowl - BODY.front),
        point = hoodPoint(sign, z);
      expect(point[0]).toBeCloseTo(sign * bodyWidth(z, bodyTop(z)), 10);
      expect(point[1]).toBeCloseTo(bodyTop(z), 10);
    }
  });
  it('fills the old front wing to hood gap', () => {
    const hood = makeHood();
    for (const z of [-2.1, -1.8, -1.5])
      expect(hits(hood, [bodyWidth(z, bodyTop(z)) - 0.01, 3, z], [0, -1, 0])).toBe(true);
    hood.dispose();
  });
  it('has a continuous roof and windshield crown', () => {
    for (let i = 0; i <= 20; i++) {
      const u = -1 + i / 10,
        screen = windshieldPoint(u, 1),
        roof = roofPoint(u, BODY.roofFront);
      screen.forEach((n, index) => expect(n).toBeCloseTo(roof[index], 10));
    }
  });
  it.each([-1, 1])('backs glazing corners and inter-pane strips on side %s', sign => {
    const cabin = makeCabinSide(sign);
    for (const [y, z] of [
      [1.46, 0.05],
      [1.93, 0.86],
      [1.7, 0.93],
      [1.48, 1.8],
    ])
      expect(hits(cabin, [sign * 3, y, z], [-sign, 0, 0])).toBe(true);
    cabin.dispose();
  });
  it('keeps windows nearly rectangular rather than rounding entire edges', () => {
    const window = makeSideWindow(1, [
      [0.04, 1.45],
      [0.04, 1.94],
      [0.88, 1.94],
      [0.88, 1.45],
    ]);
    expect(hits(window, [3, 1.47, 0.06], [-1, 0, 0])).toBe(true);
    expect(hits(window, [3, 1.92, 0.86], [-1, 0, 0])).toBe(true);
    window.computeBoundingBox();
    expect(window.boundingBox!.max.x - window.boundingBox!.min.x).toBeGreaterThan(0.05);
    window.dispose();
  });
  it('generates finite normals for every joining surface', () => {
    const surfaces = [
      makeHood(),
      makeRoof(),
      makeCowl(),
      makeSidePanel(1),
      makeSidePanel(-1),
      makeShoulder(1),
      makeShoulder(-1),
      makeWindshield(),
      makeWindshield(true),
      makeNose(),
    ];
    for (const geometry of surfaces) {
      for (const attribute of ['position', 'normal'])
        expect([...geometry.getAttribute(attribute).array].every(Number.isFinite)).toBe(true);
      geometry.dispose();
    }
  });
});
