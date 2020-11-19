import * as twgl from "twgl.js";
import { clamp } from "./utils";

export default class Camera {
  lookRadius = 5.0;
  sensitivity = 0.1;
  stepSize = 0.5;
  phi = 0;
  theta = -Math.PI / 2;
  eye = twgl.v3.create(0, 0, 0);
  up = twgl.v3.create(0, 1, 0);
  viewPoint = twgl.v3.create(0, 0, 1);

  constructor() {
    this.createEvents();
  }

  setCamera(V: twgl.m4.Mat4) {
    twgl.m4.lookAt(this.eye, this.viewPoint, this.up, V);
  }

  strafe(amount: number) {
    let dir = twgl.v3.subtract(this.viewPoint, this.eye);
    twgl.v3.normalize(dir, dir);
    twgl.v3.cross(dir, this.up, dir);
    const speed = twgl.v3.create(amount, amount, amount);
    const displacement = twgl.v3.multiply(speed, dir);
    twgl.v3.add(this.eye, displacement, this.eye);
    twgl.v3.add(this.viewPoint, displacement, this.viewPoint);
  }

  dolly(amount: number) {
    let dir = twgl.v3.subtract(this.viewPoint, this.eye);
    twgl.v3.normalize(dir, dir);
    const speed = twgl.v3.create(amount, amount, amount);
    const displacement = twgl.v3.multiply(speed, dir);
    twgl.v3.add(this.eye, displacement, this.eye);
    twgl.v3.add(this.viewPoint, displacement, this.viewPoint);
  }

  orbit(amount: number) {
    this.theta = this.sensitivity * 2 * Math.PI - Math.PI;
    this.eye[0] = this.lookRadius * Math.cos(this.phi) * Math.cos(this.theta);
    this.eye[1] = this.lookRadius * Math.sin(this.phi);
    this.eye[2] =
      this.lookRadius * Math.cos(this.phi) * Math.cos(Math.PI / 2 - this.theta);
  }

  orbitZoom(amount: number) {
    this.lookRadius += amount;
    this.viewPoint[0] = 0;
    this.viewPoint[1] = 0;
    this.viewPoint[2] = 0;
    let dir = twgl.v3.subtract(this.viewPoint, this.eye);
    twgl.v3.normalize(dir, dir);
    const speed = twgl.v3.create(amount, amount, amount);
    const displacement = twgl.v3.multiply(speed, dir);
    twgl.v3.add(this.eye, displacement, this.eye);
  }

  private lookAround(e: MouseEvent) {
    let nx = e.clientX / window.innerWidth;
    let ny = e.clientY / window.innerHeight;
    this.phi = clamp(ny * Math.PI - Math.PI / 2, -1.5, 1.5);
    this.theta = nx * 2 * Math.PI - Math.PI;
    this.viewPoint[0] =
      this.lookRadius * Math.cos(this.phi) * Math.cos(this.theta);
    this.viewPoint[1] = this.lookRadius * Math.sin(this.phi);
    this.viewPoint[2] =
      this.lookRadius * Math.cos(this.phi) * Math.cos(Math.PI / 2 - this.theta);
    twgl.v3.add(this.viewPoint, this.eye, this.viewPoint);
  }

  private freeCamKeys(e: KeyboardEvent) {
    switch (e.key) {
      case "w":
        this.dolly(-this.stepSize);
        break;
      case "s":
        this.dolly(this.stepSize);
        break;
      case "a":
        this.strafe(-this.stepSize);
        break;
      case "d":
        this.strafe(this.stepSize);
        break;
      case "p":
        console.log("eye:", this.eye);
        break;

      default:
        break;
    }
  }

  private orbitKeys(e: KeyboardEvent) {
    switch (e.key) {
      case "w":
        this.orbitZoom(-this.stepSize);
        break;
      case "s":
        this.orbitZoom(this.stepSize);
        break;
      case "a":
        this.orbit(-this.stepSize);
        break;
      case "d":
        this.orbit(this.stepSize);
        break;
      case "p":
        console.log("eye:", this.eye);
        break;

      default:
        break;
    }
  }

  private createEvents() {
    this.lookAround = this.lookAround.bind(this);
    window.addEventListener("mousemove", this.lookAround);
    this.freeCamKeys = this.freeCamKeys.bind(this);
    window.addEventListener("keydown", this.freeCamKeys);
  }
}
