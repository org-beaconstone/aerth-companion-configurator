import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import { SIZES } from '../../domain/configuration';
import { Box } from './Vehicle';
import { SCENE_PALETTE as P } from '../../design/palette';
import { createTreadMaps } from './tread-textures';
import { TREAD_SURFACES } from '../../design/surfaces';

interface RampProps {
  size: 'small' | 'medium' | 'large';
  type: 'retractable';
  coating: 'ribbed' | 'cushioned' | 'cork';
  color: string;
  stowed: boolean;
}
const FLOOR = 1.105;
function Tread({
  width,
  length,
  coating,
}: {
  width: number;
  length: number;
  coating: RampProps['coating'];
}) {
  const treadSurface = coating === 'cork' ? TREAD_SURFACES.cork : TREAD_SURFACES.cushioned;

  if (coating === 'ribbed') {
    // Ribbed: keep original box base + rib pattern unchanged
    return (
      <group>
        <Box
          size={[width, 0.025, length]}
          position={[0, 0.033, 0]}
          color={P.rampTread.hex}
          radius={0.006}
          roughness={0.96}
        />
        {Array.from({ length: Math.floor(length / 0.065) }, (_, i) => (
          <Box
            key={i}
            size={[width * 0.92, 0.01, 0.012]}
            position={[0, 0.049, -length / 2 + 0.04 + i * 0.065]}
            color={P.rampTexture.hex}
            radius={0.004}
            roughness={0.95}
          />
        ))}
      </group>
    );
  }

  // Cushioned or cork: rounded base with textured top plane
  return <TexturedTread width={width} length={length} coating={coating} surface={treadSurface} />;
}

interface TexturedTreadProps {
  width: number;
  length: number;
  coating: 'cushioned' | 'cork';
  surface: (typeof TREAD_SURFACES)[keyof typeof TREAD_SURFACES];
}

function TexturedTread({ width, length, coating, surface }: TexturedTreadProps) {
  const maps = useMemo(() => createTreadMaps(coating, width, length), [coating, width, length]);
  useEffect(() => {
    // Re-upload after React StrictMode's setup/cleanup rehearsal.
    maps.color.needsUpdate = true;
    maps.bump.needsUpdate = true;
    return () => maps.dispose();
  }, [maps]);
  const thickness = coating === 'cushioned' ? 0.038 : 0.025;
  const top = 0.03 + thickness / 2;
  return (
    <group name={`tread-${coating}`}>
      <Box
        size={[width, thickness, length]}
        position={[0, 0.03, 0]}
        radius={coating === 'cushioned' ? 0.009 : 0.005}
        color={surface.base}
        roughness={surface.roughness}
        metalness={0}
      />
      <mesh position={[0, top + 0.0003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width - 0.012, length - 0.012]} />
        <meshStandardMaterial
          map={maps.color}
          bumpMap={maps.bump}
          bumpScale={surface.bumpScale}
          roughness={surface.roughness}
          metalness={0}
          envMapIntensity={surface.envMapIntensity}
        />
      </mesh>
    </group>
  );
}
export function Ramp({ size, coating, color, stowed }: RampProps) {
  const invalidate = useThree(state => state.invalidate);
  const preset = SIZES.find(item => item.id === size)!;
  const width = preset.width / 100,
    length = preset.length / 100;
  const angle = Math.asin((FLOOR - 0.045) / length);
  const root = useRef<Group>(null);
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = useRef(stowed ? 1 : 0);
  useFrame((_, delta) => {
    progress.current = reduced
      ? stowed
        ? 1
        : 0
      : MathUtils.damp(progress.current, stowed ? 1 : 0, 7, Math.min(delta, 0.05));
    if (Math.abs(progress.current - (stowed ? 1 : 0)) > 0.0001) invalidate();
    else progress.current = stowed ? 1 : 0;
    if (root.current) {
      const t = progress.current;
      root.current.rotation.x = angle * (1 - t);
      root.current.position.y = FLOOR - 0.18 * t;
      root.current.scale.z = 1 - t * 0.7;
      root.current.position.z =
        2.26 - 0.04 * t - (Math.max(0, t - 0.35) / 0.65) * (length * 0.3 + 0.12);
    }
  });
  return (
    <group name="integrated-retractable-ramp">
      <Box size={[width + 0.13, 0.12, 0.73]} position={[0, 0.908, 1.875]} color={P.chassis.hex} />
      {[-1, 1].map(s => (
        <Box
          key={s}
          size={[0.045, 0.035, 0.72]}
          position={[s * (width / 2 + 0.065), 0.966, 1.9]}
          color={P.hardware.hex}
          metalness={0.55}
          roughness={0.4}
        />
      ))}
      <group ref={root} position={[0, FLOOR, 2.26]} rotation={[angle, 0, 0]}>
        {[0, 1, 2].map(index => {
          const len = length / 3,
            w = width - index * 0.025;
          return (
            <group key={index} position={[0, -index * 0.008, len * (index + 0.5)]}>
              <Box
                size={[w + 0.04, 0.045, len]}
                color={P.rampSupport.hex}
                metalness={0.5}
                roughness={0.4}
                radius={0.008}
              />
              <Tread width={w} length={len - 0.014} coating={coating} />
              {[-1, 1].map(sign => (
                <Box
                  key={sign}
                  size={[0.035, 0.081, len]}
                  position={[sign * (w / 2 + 0.023), 0.046, 0]}
                  color={color}
                  metalness={0.28}
                  roughness={0.32}
                  clearcoat={0.4}
                  radius={0.01}
                />
              ))}
              <Box size={[w + 0.065, 0.035, 0.033]} position={[0, 0.03, -len / 2]} color={color} />
            </group>
          );
        })}
        <Box
          size={[width + 0.1, 0.04, 0.08]}
          position={[0, -0.02, length]}
          color={P.chassis.hex}
          radius={0.012}
        />
      </group>
    </group>
  );
}
