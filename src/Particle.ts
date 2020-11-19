import type { v3 } from "twgl.js";
import * as twgl from "twgl.js";

interface ParticleOptions {
  position?: v3.Vec3;
  velocity?: v3.Vec3;
  acceleration?: v3.Vec3;
  mass?: number;
  damping?: number;
  lifespan?: number;
  scale?: number;
  color?: Vec4;
}

export default class Particle {
  position: v3.Vec3;
  velocity: v3.Vec3;
  acceleration: v3.Vec3;
  mass: number;
  damping: number;
  lifespan: number;
  scale: number;
  color: Vec4;
  endTime: number;
  initialState: ParticleOptions;

  constructor(options: ParticleOptions) {
    this.initialState = options;
    // Set initial values
    this.restart();
    // Start out transparent
    this.color[3] = 0;
    // Trigger rebirth on first update
    this.endTime = 0;
  }

  restart() {
    this.position = this.initialState.position
      ? [...this.initialState.position]
      : twgl.v3.create(0, 0, 0);
    this.velocity = this.initialState.velocity
      ? [...this.initialState.velocity]
      : twgl.v3.create(0, 0, 0);
    this.acceleration = this.initialState.acceleration
      ? [...this.initialState.acceleration]
      : twgl.v3.create(0, 0, 0);
    this.mass = this.initialState.mass || 1;
    this.damping = this.initialState.damping || 0;
    this.lifespan = this.initialState.lifespan || 1000;
    this.color = this.initialState.color
      ? [...this.initialState.color]
      : [0.5, 0.5, 0.5, 1];

    this.endTime = performance.now() + this.lifespan;
  }

  update(t: number, force: v3.Vec3) {
    if (t > this.endTime) {
      this.restart();
      return;
    }

    this.acceleration = twgl.v3.divScalar(force, this.mass);

    twgl.v3.add(this.velocity, this.acceleration, this.velocity);
    let drag = twgl.v3.negate(this.velocity);
    twgl.v3.mulScalar(drag, this.damping, drag);
    twgl.v3.add(drag, this.velocity, this.velocity);
    twgl.v3.add(this.position, this.velocity, this.position);

    this.color[3] = (this.endTime - t) / this.lifespan;
  }
}
