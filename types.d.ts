type Vec4 = [number, number, number, number];
type Vec2 = [number, number];

interface MeshAttributes {
  position: number[] | Float32Array;
  indices: number[] | Float32Array;
  normal: number[] | Float32Array;
}

interface SimulationSettings {
  numParticles: number;
  dHue: number;
  dSaturation: number;
  dBrightness: number;
  baseColor: string;
  lifespan: number;
  dLifespan: number;
  damping: number;
  baseMass: number;
  dMass: number;
  dScale: number;
  baseScale: number;
  ambient: number;
  diffuse: number;
  specular: number;
  curl: number;
  gravity: number;
  spawnInterval: number;
  graduallySpawn: boolean;
}
