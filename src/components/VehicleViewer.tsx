import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping, PCFSoftShadowMap, Vector3 } from 'three';
import { StudioEnvironment } from './vehicle/StudioEnvironment';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Vehicle } from './vehicle/Vehicle';
import { Ramp } from './vehicle/Ramp';
import { SIZES } from '../domain/configuration';
import { SCENE_PALETTE } from '../design/palette';
import { TREAD_SURFACES } from '../design/surfaces';

export interface VehicleViewerProps {
  size: 'small' | 'medium' | 'large';
  type: 'retractable';
  coating: 'ribbed' | 'cushioned' | 'cork';
  color: string;
  vehicleColor: string;
  stowed: boolean;
  showRamp: boolean;
  view: 'three-quarter' | 'rear' | 'side' | 'front' | 'cargo';
}
const PRESETS = {
  'three-quarter': { position: [6.4, 3.9, 8.7], target: [0, 1.03, 0.72] },
  rear: { position: [0, 3.0, 11.1], target: [0, 1.05, 0.9] },
  side: { position: [10.2, 3.5, 1.2], target: [0, 1.05, 0.8] },
  front: { position: [-6.4, 3.7, -8.4], target: [0, 1.05, 0.25] },
  cargo: { position: [2.7, 3.4, 6.8], target: [0, 1.22, 1.97] },
} as const;
function CameraRig({ view }: { view: VehicleViewerProps['view'] }) {
  const { camera, gl, size, invalidate } = useThree();
  const controls = useRef<OrbitControls | null>(null);
  const moving = useRef(true);
  const first = useRef(true);
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const target = useMemo(() => new Vector3(...PRESETS[view].target), [view]);
  const position = useMemo(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const preset = new Vector3(...PRESETS[view].position);
    return preset
      .sub(target)
      .multiplyScalar(aspect < 1.25 ? 1.13 : 0.96)
      .add(target);
  }, [view, target, size.width, size.height]);
  useEffect(() => {
    const control = new OrbitControls(camera, gl.domElement);
    control.enableDamping = true;
    control.dampingFactor = 0.09;
    control.enablePan = false;
    control.minDistance = 4;
    control.maxDistance = 18;
    control.maxPolarAngle = Math.PI / 2 - 0.025;
    control.minPolarAngle = 0.25;
    control.rotateSpeed = 0.65;
    control.zoomSpeed = 0.55;
    const interrupt = () => {
      moving.current = false;
    };
    const redraw = () => invalidate();
    control.addEventListener('start', interrupt);
    control.addEventListener('change', redraw);
    controls.current = control;
    return () => {
      control.removeEventListener('start', interrupt);
      control.removeEventListener('change', redraw);
      control.dispose();
      controls.current = null;
    };
  }, [camera, gl, invalidate]);
  useEffect(() => {
    moving.current = true;
    invalidate();
  }, [view, position, invalidate]);
  useFrame((_, delta) => {
    const control = controls.current;
    if (!control) return;
    if (moving.current) {
      const alpha = reduced || first.current ? 1 : 1 - Math.exp(-5 * Math.min(delta, 0.05));
      camera.position.lerp(position, alpha);
      control.target.lerp(target, alpha);
      first.current = false;
      if (camera.position.distanceToSquared(position) < 0.0001) moving.current = false;
      else invalidate();
    }
    control.update();
  });
  return null;
}

class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function Fallback(props: VehicleViewerProps) {
  const width = SIZES.find(item => item.id === props.size)!.width * 1.1;
  return (
    <div className="viewer-fallback" data-renderer="fallback">
      <svg viewBox="0 0 600 400" aria-hidden="true">
        <ellipse
          cx="300"
          cy="328"
          rx="190"
          ry="22"
          fill={SCENE_PALETTE.studioGround.hex}
          opacity=".13"
        />
        <rect x="168" y="154" width="43" height="130" rx="15" fill={SCENE_PALETTE.tire.hex} />
        <rect x="389" y="154" width="43" height="130" rx="15" fill={SCENE_PALETTE.tire.hex} />
        <rect
          x="179"
          y="105"
          width="242"
          height="156"
          rx="21"
          fill={props.vehicleColor}
          stroke={SCENE_PALETTE.seam.hex}
        />
        <rect x="210" y="115" width="180" height="122" rx="11" fill={SCENE_PALETTE.interior.hex} />
        <path d="M215 228h170l-20-36H238Z" fill={SCENE_PALETTE.cargoMat.hex} />
        <rect x="179" y="246" width="242" height="19" rx="5" fill={SCENE_PALETTE.trim.hex} />
        <path
          d="M181 110 200 65H399l22 45Z"
          fill={props.vehicleColor}
          stroke={SCENE_PALETTE.seam.hex}
        />
        <path d="m216 76-10 25h189l-11-25Z" fill={SCENE_PALETTE.glass.hex} />
        <rect x="190" y="145" width="9" height="41" rx="3" fill={SCENE_PALETTE.taillight.hex} />
        <rect x="401" y="145" width="9" height="41" rx="3" fill={SCENE_PALETTE.taillight.hex} />
        {props.showRamp && (
          props.stowed ? (
            <rect x="260" y="239" width="80" height="7" fill={props.color} />
          ) : (
            <>
              <path
                d={`M${300 - width / 2} 234h${width}l28 104H${272 - width / 2}Z`}
                fill={TREAD_SURFACES[props.coating].base}
                stroke={props.color}
                strokeWidth="7"
              />
              {Array.from({ length: 10 }, (_, i) => (
                <path
                  key={i}
                  d={`M${297 - width / 2 - i * 2.2} ${244 + i * 9}h${width + 6 + i * 4.4}`}
                  stroke={SCENE_PALETTE.rampTexture.hex}
                  opacity=".35"
                />
              ))}
            </>
          )
        )}
      </svg>
      <p>3D is unavailable. Showing a simplified rear preview.</p>
    </div>
  );
}
function Studio(props: VehicleViewerProps) {
  const { gl } = useThree();
  useEffect(() => {
    gl.shadowMap.enabled = true;
  }, [gl]);
  return (
    <>
      <StudioEnvironment />
      <ambientLight intensity={0.28} color={SCENE_PALETTE.studioWhite.hex} />
      <hemisphereLight
        args={[SCENE_PALETTE.studioWhite.hex, SCENE_PALETTE.studioGround.hex, 0.4]}
      />
      <directionalLight
        castShadow
        position={[-3.5, 7, 4]}
        intensity={2.8}
        color={SCENE_PALETTE.studioWhite.hex}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-far={25}
        shadow-normalBias={0.035}
        shadow-bias={-0.0002}
        shadow-radius={4}
      />
      <directionalLight
        position={[6, 4, -5]}
        intensity={0.6}
        color={SCENE_PALETTE.studioWhite.hex}
      />
      <Vehicle color={props.vehicleColor} />
      {props.showRamp && <Ramp {...props} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <shadowMaterial transparent opacity={0.24} />
      </mesh>
      <CameraRig view={props.view} />
    </>
  );
}
export default function VehicleViewer(props: VehicleViewerProps) {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const cleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanup.current?.(), []);
  const fallback = <Fallback {...props} />;
  return (
    <div
      className="vehicle-viewer"
      role="img"
      aria-label={`Original SUV with open tailgate. ${props.view} view${props.showRamp ? `, ${props.size} ${props.type}, ${props.coating} surface, ${props.stowed ? 'stowed' : 'deployed'}` : ''}.`}
      data-view={props.view}
      data-size={props.size}
      data-type={props.type}
      data-coating={props.coating}
      data-color={props.color}
      data-vehicle-color={props.vehicleColor}
      data-stowed={props.stowed}
      data-show-ramp={props.showRamp}
      data-ready={ready}
    >
      {failed ? (
        fallback
      ) : (
        <SceneBoundary fallback={fallback}>
          <Canvas
            frameloop="demand"
            shadows
            dpr={[1, 1.5]}
            camera={{ position: [6.4, 3.9, 8.7], fov: 37, near: 0.1, far: 250 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            fallback={fallback}
            onCreated={({ gl }) => {
              const lost = (event: Event) => {
                event.preventDefault();
                setFailed(true);
              };
              gl.domElement.addEventListener('webglcontextlost', lost);
              cleanup.current = () => gl.domElement.removeEventListener('webglcontextlost', lost);
              gl.setClearColor(0x000000, 0);
              gl.toneMapping = ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.0;
              gl.shadowMap.type = PCFSoftShadowMap;
              setReady(true);
            }}
          >
            <Studio {...props} />
          </Canvas>
        </SceneBoundary>
      )}
    </div>
  );
}
