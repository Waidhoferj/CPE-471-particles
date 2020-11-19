import Particle from "./Particle";
import * as convert from "color-convert";
import type { v3, ProgramInfo } from "twgl.js";
import * as twgl from "twgl.js";
import { dist, clamp } from "./utils";

export default class ParticleSystem {
  particles: Particle[];
  spawnBound: number = 0;
  time: number = 0;
  center: v3.Vec3 = twgl.v3.create(0, 2, 0);
  settings: SimulationSettings;
  colorBuf: Float32Array;
  posBuf: Float32Array;
  scaleBuf: Float32Array;
  bufferInfo: twgl.BufferInfo;
  spawnInterval: NodeJS.Timeout;
  gravity: v3.Vec3;

  constructor(settings: SimulationSettings, gl: WebGL2RenderingContext) {
    this.refresh(gl, settings);
  }

  initialSpawn() {
    clearInterval(this.spawnInterval);
    if (!this.settings.graduallySpawn) {
      this.spawnBound = this.particles.length;
      return;
    }
    this.spawnBound = 0;
    this.spawnInterval = setInterval(() => {
      this.spawnBound++;
      if (this.spawnBound === this.particles.length)
        clearInterval(this.spawnInterval);
    }, this.settings.spawnInterval * 1000);
  }

  refresh(gl: WebGL2RenderingContext, settings: SimulationSettings) {
    this.settings = { ...settings };
    this.particles = new Array(settings.numParticles);
    this.posBuf = new Float32Array(settings.numParticles * 3);
    this.colorBuf = new Float32Array(settings.numParticles * 4);
    this.scaleBuf = new Float32Array(settings.numParticles);
    this.gravity = twgl.v3.create(0, this.settings.gravity, 0);
    let i: number;
    const baseColor = convert.hex.hsl(settings.baseColor.slice(1));
    for (i = 0; i < settings.numParticles; i++) {
      let pHsl = [0, 0, 0];
      pHsl[0] = clamp(dist(baseColor[0], settings.dHue), 0, 360);
      pHsl[1] = clamp(dist(baseColor[1], settings.dSaturation), 0, 100);
      pHsl[2] = clamp(dist(baseColor[2], settings.dBrightness), 0, 100);
      let color: Vec4 = [
        ...convert.hsl.rgb(pHsl).map((c: number) => c / 255),
        1,
      ] as Vec4;
      let scale = Math.max(dist(settings.baseScale, settings.dScale), 0);
      this.particles[i] = new Particle({
        position: twgl.v3.create(dist(0, 5), 0, dist(0, 5)),
        mass: Math.max(dist(settings.baseMass, settings.dMass), 0.1),
        damping: settings.damping,
        lifespan: Math.max(dist(settings.lifespan, settings.dLifespan), 0),
        scale,
        color,
      });

      this.scaleBuf[i] = scale;
    }
    this.initialSpawn();
    this.setupGPU(gl);
    this.updateBuffers(gl);
  }

  draw(gl: WebGL2RenderingContext, prog: ProgramInfo) {
    twgl.setBuffersAndAttributes(gl, prog, this.bufferInfo);
    twgl.drawBufferInfo(gl, this.bufferInfo, gl.POINTS);
  }

  getForce(pos: v3.Vec3): v3.Vec3 {
    let dir = twgl.v3.subtract(pos, this.center);
    let dist = twgl.v3.length(dir);
    twgl.v3.normalize(dir, dir);
    let outForce = twgl.v3.divScalar(dir, dist * 120);
    twgl.v3.normalize(outForce, outForce);
    let sideForce = twgl.v3.cross(twgl.v3.create(0, 1, 0), outForce);
    twgl.v3.normalize(sideForce, sideForce);
    twgl.v3.mulScalar(sideForce, this.settings.curl, sideForce);
    return twgl.v3.add(twgl.v3.add(outForce, sideForce), this.gravity);
  }

  setupGPU(gl: WebGL2RenderingContext) {
    this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
      position: { numComponents: 3, data: this.posBuf },
      color: { numComponents: 4, data: this.colorBuf },
      scale: { numComponents: 1, data: this.scaleBuf },
    });
  }

  updateBuffers(gl: WebGL2RenderingContext) {
    //go through all the particles and update the CPU buffer
    let i: number;
    let pos: twgl.v3.Vec3;
    let color: Vec4;
    for (i = 0; i < this.spawnBound; i++) {
      pos = this.particles[i].position;
      color = this.particles[i].color;
      let pos_i = i * 3;
      let color_i = i * 4;
      this.posBuf[pos_i] = pos[0];
      this.posBuf[pos_i + 1] = pos[1];
      this.posBuf[pos_i + 2] = pos[2];

      this.colorBuf[color_i] = color[0];
      this.colorBuf[color_i + 1] = color[1];
      this.colorBuf[color_i + 2] = color[2];
      this.colorBuf[color_i + 3] = color[3];
    }

    twgl.setAttribInfoBufferFromArray(
      gl,
      this.bufferInfo.attribs.position,
      this.posBuf
    );

    twgl.setAttribInfoBufferFromArray(
      gl,
      this.bufferInfo.attribs.color,
      this.colorBuf
    );
  }

  update(t: number, gl: WebGL2RenderingContext, V: twgl.m4.Mat4) {
    let i;
    for (i = 0; i < this.spawnBound; i++) {
      if (this.spawnBound > this.particles.length) debugger;
      let f = this.getForce(this.particles[i].position);
      this.particles[i].update(t, f);
    }

    this.updateBuffers(gl);
  }
}
