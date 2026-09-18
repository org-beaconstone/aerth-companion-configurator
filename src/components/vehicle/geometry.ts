import {
  BufferGeometry,
  Float32BufferAttribute,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3,
  TubeGeometry,
  CatmullRomCurve3,
} from 'three';

const WHEELS = [-1.46, 1.52];
export const BODY = {
  front: -2.3,
  rear: 2.3,
  cowl: -1.2,
  belt: 1.415,
  roofFront: -0.88,
  roofRear: 1.97,
  roof: 1.99,
} as const;

/** The hood and side panels use exactly the same height and width at their join. */
export function bodyTop(z: number): number {
  return BODY.belt - 0.13 * Math.max(0, (BODY.cowl - z) / (BODY.cowl - BODY.front));
}
export function bodyWidth(z: number, y: number): number {
  const t = Math.max(0, Math.min(1, (y - 0.5) / 0.95));
  const shoulder = 0.075 * Math.exp(-Math.pow((t - 0.78) / 0.25, 2));
  const flare = WHEELS.reduce(
    (sum, wheel) => sum + 0.036 * Math.exp(-Math.pow((z - wheel) / 0.56, 2)),
    0
  );
  const end = Math.max(0, (Math.abs(z) - 1.94) / 0.4);
  return 0.94 + 0.055 * Math.sin(t * Math.PI) + shoulder + flare - 0.12 * end * end;
}
export function cabinWidth(y: number): number {
  return 0.955 - (y - 1.42) * 0.2;
}
export function cabinFront(y: number): number {
  return BODY.cowl + ((BODY.roofFront - BODY.cowl) * (y - BODY.belt)) / (BODY.roof - BODY.belt);
}
export function cabinRear(y: number): number {
  return BODY.rear + ((BODY.roofRear - BODY.rear) * (y - BODY.belt)) / (BODY.roof - BODY.belt);
}

function grid(
  columns: number,
  rows: number,
  point: (u: number, v: number) => [number, number, number]
): BufferGeometry {
  const positions: number[] = [],
    indices: number[] = [];
  for (let row = 0; row <= rows; row++)
    for (let col = 0; col <= columns; col++) positions.push(...point(col / columns, row / rows));
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < columns; col++) {
      const a = row * (columns + 1) + col,
        b = a + columns + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
export function makeSidePanel(sign: number): BufferGeometry {
  return grid(18, 160, (vertical, longitudinal) => {
    const z = BODY.front + longitudinal * (BODY.rear - BODY.front);
    let bottom = 0.5;
    for (const wheel of WHEELS) {
      const dz = z - wheel;
      if (Math.abs(dz) < 0.59) bottom = Math.max(bottom, 0.52 + Math.sqrt(0.59 ** 2 - dz ** 2));
    }
    const y = bottom + (bodyTop(z) - bottom) * vertical;
    return [sign * bodyWidth(z, y), y, z];
  });
}
export function hoodPoint(u: number, z: number): [number, number, number] {
  const edgeY = bodyTop(z);
  return [u * bodyWidth(z, edgeY), edgeY + 0.052 * (1 - u * u), z];
}
export function makeHood(): BufferGeometry {
  return grid(32, 44, (u, v) => hoodPoint(u * 2 - 1, BODY.front + v * (BODY.cowl - BODY.front)));
}
export function roofPoint(u: number, z: number): [number, number, number] {
  return [u * cabinWidth(BODY.roof), BODY.roof + 0.065 * (1 - u * u), z];
}
export function makeRoof(): BufferGeometry {
  return grid(32, 44, (u, v) =>
    roofPoint(u * 2 - 1, BODY.roofFront + v * (BODY.roofRear - BODY.roofFront))
  );
}

/** Explicit shoulder sheet fills the inset between lower body and tapered cabin. */
export function makeShoulder(sign: number): BufferGeometry {
  return grid(8, 100, (u, v) => {
    const z = BODY.cowl + v * (BODY.rear - BODY.cowl);
    return [
      sign * (bodyWidth(z, BODY.belt) * (1 - u) + cabinWidth(BODY.belt) * u),
      BODY.belt + 0.012 * Math.sin(u * Math.PI),
      z,
    ];
  });
}
/** Opaque underlying panel means small window corners reveal paint, never daylight. */
export function makeCabinSide(sign: number): BufferGeometry {
  return grid(48, 16, (u, v) => {
    const y = BODY.belt + v * (BODY.roof - BODY.belt);
    return [sign * cabinWidth(y), y, cabinFront(y) + u * (cabinRear(y) - cabinFront(y))];
  });
}
/** Shared cowl/roof boundary including the center crown, with glass offset outwards. */
export function windshieldPoint(u: number, v: number): [number, number, number] {
  const y = BODY.belt + v * (BODY.roof - BODY.belt);
  return [
    u * cabinWidth(y),
    y + (0.052 + 0.013 * v) * (1 - u * u),
    cabinFront(y) - 0.013 * (1 - u * u) * Math.sin(v * Math.PI),
  ];
}
export function makeWindshield(glass = false): BufferGeometry {
  return grid(32, 20, (u, v) => {
    const point = windshieldPoint((u * 2 - 1) * (glass ? 0.92 : 1), glass ? 0.065 + v * 0.87 : v);
    point[2] -= glass ? 0.005 : 0;
    return point;
  });
}
/** Narrow shoulder/cowl connector closes the remaining lateral hood inset. */
export function makeCowl(): BufferGeometry {
  return grid(32, 6, (u, v) => {
    const hood = hoodPoint(u * 2 - 1, BODY.cowl);
    const screen = windshieldPoint(u * 2 - 1, 0);
    return [hood[0] + (screen[0] - hood[0]) * v, hood[1], BODY.cowl];
  });
}
/** Nose closes the top-to-side perimeter behind the grille/bumper details. */
export function makeNose(): BufferGeometry {
  return grid(32, 18, (u, v) => {
    const x = u * 2 - 1;
    const top = hoodPoint(x, BODY.front)[1];
    const y = 0.5 + v * (top - 0.5);
    return [x * bodyWidth(BODY.front, Math.min(y, bodyTop(BODY.front))), y, BODY.front];
  });
}
/** Rear portal fills only side jambs/lower sheet; cargo access stays genuinely open. */
export function makeRearJamb(sign: number): BufferGeometry {
  return grid(12, 22, (u, v) => {
    const y = 1.08 + v * (BODY.roof - 1.08);
    const x = y > BODY.belt ? cabinWidth(y) : bodyWidth(BODY.rear, y);
    return [sign * (0.78 + (x - 0.78) * u), y, y > BODY.belt ? cabinRear(y) : BODY.rear];
  });
}
export function makeRearLower(): BufferGeometry {
  return grid(24, 10, (u, v) => {
    const y = 0.5 + v * 0.58;
    return [(u * 2 - 1) * bodyWidth(BODY.rear, y), y, BODY.rear];
  });
}

/** Short rounded corners, with long straight window edges instead of midpoint ovals. */
export function makeSideWindow(
  sign: number,
  points: [number, number][],
  radius = 0.022
): BufferGeometry {
  const corners = points.map((point, i) => {
    const vertex = new Vector2(...point),
      previous = new Vector2(...points[(i + points.length - 1) % points.length]),
      next = new Vector2(...points[(i + 1) % points.length]);
    const r = Math.min(radius, vertex.distanceTo(previous) * 0.18, vertex.distanceTo(next) * 0.18);
    return {
      vertex,
      enter: vertex.clone().add(previous.sub(vertex).normalize().multiplyScalar(r)),
      exit: vertex.clone().add(next.sub(vertex).normalize().multiplyScalar(r)),
    };
  });
  const shape = new Shape();
  shape.moveTo(corners[0].enter.x, corners[0].enter.y);
  for (const corner of corners) {
    shape.lineTo(corner.enter.x, corner.enter.y);
    shape.quadraticCurveTo(corner.vertex.x, corner.vertex.y, corner.exit.x, corner.exit.y);
  }
  shape.closePath();
  const geometry = new ShapeGeometry(shape, 8),
    position = geometry.getAttribute('position');
  for (let i = 0; i < position.count; i++) {
    const z = position.getX(i),
      y = position.getY(i);
    position.setXYZ(i, sign * (cabinWidth(y) + 0.004), y, z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function makeTrimLine(points: [number, number, number][], radius: number): TubeGeometry {
  return new TubeGeometry(
    new CatmullRomCurve3(points.map(point => new Vector3(...point))),
    Math.max(12, points.length * 6),
    radius,
    6,
    false
  );
}
