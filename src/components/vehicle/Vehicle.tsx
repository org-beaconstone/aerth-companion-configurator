import { memo, useEffect, useMemo } from 'react';
import { DoubleSide, Vector2, type BufferGeometry } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { ThreeElements } from '@react-three/fiber';
import { SCENE_PALETTE as P, VEHICLE_FINISH as F } from '../../design/palette';
import {
  BODY,
  bodyWidth,
  makeHood,
  makeRoof,
  makeShoulder,
  makeCabinSide,
  makeWindshield,
  makeCowl,
  makeNose,
  makeRearJamb,
  makeRearLower,
  makeSidePanel,
  makeSideWindow,
  makeTrimLine,
} from './geometry';

type BoxProps = {
  size: [number, number, number];
  color: string;
  radius?: number;
  metalness?: number;
  roughness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
} & Omit<ThreeElements['mesh'], 'args' | 'color'>;
export function Box({
  size,
  color,
  radius = 0.035,
  metalness = 0.15,
  roughness = 0.55,
  clearcoat = 0,
  clearcoatRoughness = 0.2,
  ...props
}: BoxProps) {
  const [w, h, d] = size;
  const geometry = useMemo(
    () =>
      new RoundedBoxGeometry(
        w,
        h,
        d,
        Math.min(w, h, d) < 0.045 ? 2 : 4,
        Math.min(radius, w / 2.05, h / 2.05, d / 2.05)
      ),
    [w, h, d, radius]
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} castShadow receiveShadow {...props}>
      {clearcoat > 0 ? (
        <meshPhysicalMaterial
          color={color}
          metalness={metalness}
          roughness={roughness}
          clearcoat={clearcoat}
          clearcoatRoughness={clearcoatRoughness}
        />
      ) : (
        <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
      )}
    </mesh>
  );
}
function PaintBox(props: BoxProps) {
  return <Box {...F.body} {...props} />;
}
function TrimBox(props: BoxProps) {
  return <Box {...F.trim} {...props} />;
}
function GlassBox(props: BoxProps) {
  return <Box {...F.glass} {...props} />;
}

function Surface({
  geometry,
  color,
  glass = false,
}: {
  geometry: BufferGeometry;
  color: string;
  glass?: boolean;
}) {
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshPhysicalMaterial color={color} {...(glass ? F.glass : F.body)} side={DoubleSide} />
    </mesh>
  );
}
function Line({
  points,
  radius = 0.004,
  color = P.seam.hex,
}: {
  points: [number, number, number][];
  radius?: number;
  color?: string;
}) {
  const geometry = useMemo(() => makeTrimLine(points, radius), [points, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color={color} roughness={0.62} metalness={0.12} />
    </mesh>
  );
}

function Wheel({ x, z }: { x: number; z: number }) {
  const face = Math.sign(x);
  const profile = useMemo(
    () =>
      [
        [0.3, -0.15],
        [0.405, -0.15],
        [0.467, -0.135],
        [0.495, -0.09],
        [0.5, -0.04],
        [0.5, 0.04],
        [0.495, 0.09],
        [0.467, 0.135],
        [0.405, 0.15],
        [0.3, 0.15],
        [0.3, -0.15],
      ].map(([radius, depth]) => new Vector2(radius, depth)),
    []
  );
  return (
    <group position={[x, 0.515, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[profile, 64]} />
        <meshStandardMaterial color={P.tire.hex} roughness={0.88} />
      </mesh>
      {[-0.075, 0, 0.075].map(y => (
        <mesh key={y} rotation={[Math.PI / 2, 0, 0]} position={[0, y, 0]}>
          <torusGeometry args={[0.499, 0.0025, 4, 64]} />
          <meshStandardMaterial color={P.chassis.hex} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, -face * 0.128, 0]}>
        <cylinderGeometry args={[0.345, 0.345, 0.035, 48]} />
        <meshStandardMaterial color={P.chassis.hex} roughness={0.55} metalness={0.3} />
      </mesh>
      <mesh position={[0, -face * 0.151, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.348, 0.014, 10, 64]} />
        <meshPhysicalMaterial color={P.wheel.hex} {...F.hardware} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 5, 0]}>
          {[-1, 1].map(s => (
            <Box
              key={s}
              size={[0.035, 0.026, 0.25]}
              position={[s * 0.047, -face * 0.159, 0.19]}
              rotation={[0, s * 0.14, 0]}
              color={P.wheel.hex}
              {...F.hardware}
              radius={0.009}
            />
          ))}
          <mesh position={[0, -face * 0.18, 0.066]}>
            <cylinderGeometry args={[0.012, 0.012, 0.018, 10]} />
            <meshStandardMaterial color={P.hardware.hex} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -face * 0.17, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.03, 32]} />
        <meshPhysicalMaterial color={P.wheel.hex} {...F.hardware} />
      </mesh>
    </group>
  );
}

function SculptedVehicle({ color }: { color: string }) {
  const geometries = useMemo(() => {
    const sides = [-1, 1].map(makeSidePanel);
    const hood = makeHood();
    const roof = makeRoof();
    const shoulders = [-1, 1].map(makeShoulder);
    const cabinSides = [-1, 1].map(makeCabinSide);
    const windshieldFrame = makeWindshield();
    const cowl = makeCowl();
    const windshield = makeWindshield(true);
    const nose = makeNose();
    const rearJambs = [-1, 1].map(makeRearJamb);
    const rearLower = makeRearLower();
    const windows = [-1, 1].map(sign => [
      makeSideWindow(sign, [
        [-1.15, 1.45],
        [-0.84, 1.94],
        [-0.04, 1.94],
        [-0.04, 1.45],
      ]),
      makeSideWindow(sign, [
        [0.04, 1.45],
        [0.04, 1.94],
        [0.88, 1.94],
        [0.88, 1.45],
      ]),
      makeSideWindow(sign, [
        [0.98, 1.45],
        [0.98, 1.94],
        [1.68, 1.92],
        [1.83, 1.45],
      ]),
    ]);
    return {
      sides,
      hood,
      roof,
      windows,
      shoulders,
      cabinSides,
      windshieldFrame,
      windshield,
      cowl,
      nose,
      rearJambs,
      rearLower,
    };
  }, []);
  useEffect(
    () => () => {
      Object.values(geometries)
        .flat(2)
        .forEach(geometry => geometry.dispose());
    },
    [geometries]
  );
  return (
    <group name="sculpted-suv">
      <TrimBox
        size={[1.76, 0.16, 4.24]}
        position={[0, 0.54, 0]}
        color={P.chassis.hex}
        radius={0.075}
      />
      <Surface geometry={geometries.hood} color={color} />
      <Surface geometry={geometries.nose} color={color} />
      <Surface geometry={geometries.rearLower} color={color} />
      <PaintBox
        size={[1.76, 0.39, 0.18]}
        position={[0, 1.055, -2.23]}
        color={color}
        radius={0.085}
      />
      <PaintBox size={[1.76, 0.3, 0.25]} position={[0, 0.76, -2.22]} color={color} radius={0.11} />
      <TrimBox
        size={[1.38, 0.11, 0.14]}
        position={[0, 0.605, -2.32]}
        color={P.trim.hex}
        radius={0.05}
      />
      <TrimBox
        size={[0.97, 0.17, 0.055]}
        position={[0, 1.056, -2.329]}
        color={P.chassis.hex}
        radius={0.04}
      />
      {[-0.39, -0.26, -0.13, 0, 0.13, 0.26, 0.39].map(x => (
        <Box
          key={x}
          size={[0.015, 0.12, 0.02]}
          position={[x, 1.056, -2.365]}
          color={P.trim.hex}
          metalness={0.3}
          roughness={0.5}
          radius={0.005}
        />
      ))}
      {[-1, 1].map((sign, index) => (
        <group key={sign}>
          <Surface geometry={geometries.sides[index]} color={color} />
          <Surface geometry={geometries.shoulders[index]} color={color} />
          <Surface geometry={geometries.cabinSides[index]} color={color} />
          <Surface geometry={geometries.rearJambs[index]} color={color} />
          {geometries.windows[index].map((geometry, i) => (
            <Surface key={i} geometry={geometry} color={P.glass.hex} glass />
          ))}
          {/* Window frames are flush parts of the opaque cabin sheet, not tubular hoops. */}
          {/* Flat painted strips between panes are part of the continuous cabin sheet. */}
          <Line
            points={Array.from({ length: 16 }, (_, i) => {
              const z = -1.17 + (i / 15) * 3.07;
              return [sign * (bodyWidth(z, 1.398) + 0.003), 1.398, z] as [number, number, number];
            })}
            radius={0.016}
            color={color}
          />
          {/* Restrained shoulder crease and recessed door shut-lines follow the sculpted skin. */}
          <Line
            points={Array.from({ length: 20 }, (_, i) => {
              const z = -1.98 + (i / 19) * 3.99;
              return [sign * (bodyWidth(z, 1.29) + 0.002), 1.29, z] as [number, number, number];
            })}
            radius={0.0025}
            color={P.seam.hex}
          />
          {[-0.91, 0.12, 1.07].map(z => (
            <Line
              key={z}
              points={Array.from({ length: 10 }, (_, i) => {
                const y = 0.6 + (i / 9) * 0.78;
                return [sign * (bodyWidth(z, y) + 0.003), y, z] as [number, number, number];
              })}
              radius={0.0035}
            />
          ))}
          {[-0.1, 0.9].map(z => (
            <PaintBox
              key={z}
              size={[0.03, 0.032, 0.18]}
              position={[sign * (bodyWidth(z, 1.27) + 0.017), 1.27, z]}
              color={color}
              radius={0.014}
            />
          ))}
          <TrimBox
            size={[0.12, 0.1, 1.64]}
            position={[sign * 0.976, 0.53, 0.03]}
            color={P.trim.hex}
            radius={0.045}
          />
          <Box
            size={[0.072, 0.09, 0.14]}
            position={[sign * 0.971, 1.54, -1.0]}
            color={P.trim.hex}
            radius={0.034}
          />
          <PaintBox
            size={[0.25, 0.145, 0.26]}
            position={[sign * 1.084, 1.565, -0.99]}
            color={color}
            radius={0.069}
          />
          <GlassBox
            size={[0.2, 0.099, 0.022]}
            position={[sign * 1.1, 1.57, -0.86]}
            color={P.glass.hex}
            radius={0.012}
          />
          <Line
            points={[
              [sign * 0.75, 2.043, -0.57],
              [sign * 0.76, 2.09, 0.1],
              [sign * 0.76, 2.09, 1.18],
              [sign * 0.75, 2.03, 1.61],
            ]}
            radius={0.018}
            color={P.trim.hex}
          />
          <Wheel x={sign * 1.0} z={-1.46} />
          <Wheel x={sign * 1.0} z={1.52} />
          {[-1.46, 1.52].map(z => (
            <Line
              key={z}
              points={Array.from({ length: 35 }, (_, i) => {
                const angle = (Math.PI * i) / 34;
                const zz = z + 0.594 * Math.cos(angle),
                  y = 0.52 + 0.594 * Math.sin(angle);
                return [sign * (bodyWidth(zz, y) + 0.009), y, zz] as [number, number, number];
              })}
              radius={0.026}
              color={P.trim.hex}
            />
          ))}
          <GlassBox
            size={[0.3, 0.075, 0.045]}
            position={[sign * 0.68, 1.153, -2.33]}
            color={P.headlight.hex}
            radius={0.024}
          />
          <PaintBox
            size={[0.14, 0.76, 0.17]}
            position={[sign * 0.86, 1.52, 2.08]}
            color={color}
            radius={0.068}
          />
          <GlassBox
            size={[0.095, 0.25, 0.055]}
            position={[sign * 0.864, 1.246, 2.208]}
            color={P.taillight.hex}
            radius={0.023}
          />
        </group>
      ))}
      {/* Crowned roof, curved cowl and raked windshield. */}
      <Surface geometry={geometries.roof} color={color} />
      <Surface geometry={geometries.cowl} color={color} />
      <Surface geometry={geometries.windshieldFrame} color={color} />
      <Surface geometry={geometries.windshield} color={P.glass.hex} glass />
      <Line
        points={[
          [-0.75, 1.42, -1.21],
          [0, 1.43, -1.23],
          [0.75, 1.42, -1.21],
        ]}
        radius={0.012}
        color={P.trim.hex}
      />
      {/* Actual hollow cargo area and a dedicated below-floor ramp pocket. */}
      <TrimBox
        size={[1.69, 0.1, 2.05]}
        position={[0, 1.035, 1.17]}
        color={P.interior.hex}
        radius={0.035}
      />
      <TrimBox
        size={[1.58, 0.016, 1.23]}
        position={[0, 1.093, 1.55]}
        color={P.cargoMat.hex}
        radius={0.006}
      />
      {Array.from({ length: 15 }, (_, i) => (
        <Box
          key={i}
          size={[1.51, 0.0015, 0.003]}
          position={[0, 1.102, 0.99 + i * 0.075]}
          color={P.interior.hex}
          roughness={1}
          radius={0.0005}
        />
      ))}
      {[-1, 1].map(sign => (
        <TrimBox
          key={sign}
          size={[0.09, 0.27, 1.35]}
          position={[sign * 0.83, 1.25, 1.5]}
          color={P.interior.hex}
          radius={0.04}
        />
      ))}
      {[-0.4, 0.4].map(x => (
        <group key={x}>
          <TrimBox
            size={[0.7, 0.6, 0.21]}
            position={[x, 1.39, 0.47]}
            rotation={[-0.07, 0, 0]}
            color={P.interior.hex}
            radius={0.1}
          />
          <TrimBox
            size={[0.3, 0.19, 0.14]}
            position={[x, 1.77, 0.42]}
            color={P.interior.hex}
            radius={0.065}
          />
        </group>
      ))}
      <PaintBox size={[1.81, 0.24, 0.31]} position={[0, 0.8, 2.18]} color={color} radius={0.1} />
      <TrimBox
        size={[1.64, 0.085, 0.15]}
        position={[0, 0.64, 2.26]}
        color={P.trim.hex}
        radius={0.04}
      />
      <TrimBox
        size={[1.56, 0.047, 0.13]}
        position={[0, 1.075, 2.22]}
        color={P.interior.hex}
        radius={0.016}
      />
      {/* Open liftgate perimeter stays thin and curved, not a solid slab. */}
      <PaintBox
        size={[1.72, 0.09, 0.075]}
        position={[0, BODY.roof - 0.025, BODY.roofRear]}
        color={color}
        radius={0.025}
      />
      <group position={[0, 2.02, 1.93]} rotation={[-1.89, 0, 0]}>
        <PaintBox
          size={[1.72, 0.88, 0.055]}
          position={[0, -0.415, 0.007]}
          color={color}
          radius={0.025}
        />
        <PaintBox size={[1.7, 0.12, 0.09]} position={[0, -0.025, 0]} color={color} radius={0.042} />
        {[-1, 1].map(sign => (
          <PaintBox
            key={sign}
            size={[0.085, 0.79, 0.09]}
            position={[sign * 0.818, -0.4, 0]}
            rotation={[0, 0, sign * 0.03]}
            color={color}
            radius={0.039}
          />
        ))}
        <GlassBox
          size={[1.55, 0.51, 0.035]}
          position={[0, -0.325, -0.032]}
          color={P.glass.hex}
          radius={0.016}
        />
        <PaintBox size={[1.68, 0.23, 0.12]} position={[0, -0.76, 0]} color={color} radius={0.055} />
        <TrimBox
          size={[0.25, 0.025, 0.04]}
          position={[0, -0.76, -0.075]}
          color={P.trim.hex}
          radius={0.01}
        />
      </group>
      {[-0.77, 0.77].map(x => (
        <Line
          key={x}
          points={[
            [x, 1.65, 2.0],
            [x, 2.04, 2.36],
          ]}
          radius={0.009}
          color={P.hardware.hex}
        />
      ))}
    </group>
  );
}

export const Vehicle = memo(SculptedVehicle);
