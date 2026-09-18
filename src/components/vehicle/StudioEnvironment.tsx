import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import {
  BackSide,
  BoxGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  type BufferGeometry,
  type Material,
} from 'three';

/** Local softbox reflections, not a remote HDR image or a visible backdrop. */
export function StudioEnvironment({ intensity = 0.7 }: { intensity?: number }) {
  const { scene, gl } = useThree();
  useEffect(() => {
    const previous = scene.environment,
      previousIntensity = scene.environmentIntensity;
    const studio = new Scene();
    const resources: Array<BufferGeometry | Material> = [];
    const roomGeometry = new BoxGeometry(22, 14, 22);
    const roomMaterial = new MeshBasicMaterial({ color: '#9b9b9b', side: BackSide });
    resources.push(roomGeometry, roomMaterial);
    const room = new Mesh(roomGeometry, roomMaterial);
    room.position.y = 5;
    studio.add(room);
    const panel = (
      name: string,
      width: number,
      height: number,
      position: [number, number, number],
      brightness: number
    ) => {
      const geometry = new PlaneGeometry(width, height);
      const material = new MeshBasicMaterial({
        color: new Color().setScalar(brightness),
        side: DoubleSide,
        toneMapped: false,
      });
      resources.push(geometry, material);
      const mesh = new Mesh(geometry, material);
      mesh.name = name;
      mesh.position.set(...position);
      mesh.lookAt(0, 1, 0);
      studio.add(mesh);
    };
    panel('left-softbox', 4, 6, [-5, 3, -2], 3.6);
    panel('right-softbox', 3, 5, [5, 3, 1], 2.2);
    panel('ceiling-strip', 3, 6, [0, 7, 0], 2.8);
    panel('neutral-ground', 18, 18, [0, -1, 0], 0.16);
    const generator = new PMREMGenerator(gl);
    const target = generator.fromScene(studio, 0.035, 0.1, 40, { size: 256 });
    scene.environment = target.texture;
    scene.environmentIntensity = intensity;
    // Source meshes and generator are no longer needed after baking the cubemap.
    resources.forEach(resource => resource.dispose());
    generator.dispose();
    return () => {
      scene.environment = previous;
      scene.environmentIntensity = previousIntensity;
      target.dispose();
    };
  }, [scene, gl, intensity]);
  return null;
}
