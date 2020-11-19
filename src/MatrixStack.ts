import * as twgl from "twgl.js";

export default class MatrixStack {
  #stack: twgl.m4.Mat4[] = [];

  constructor() {
    this.#stack.push(twgl.m4.identity());
  }

  get top() {
    return this.#stack[this.#stack.length - 1];
  }

  get length() {
    return this.#stack.length;
  }

  push() {
    this.#stack.push(twgl.m4.copy(this.top));
  }

  pop() {
    this.#stack.pop();
  }

  translate(x: number, y: number, z: number) {
    twgl.m4.translate(this.top, twgl.v3.create(x, y, z), this.top);
  }

  scale(x: number, y: number, z: number) {
    twgl.m4.scale(this.top, twgl.v3.create(x, y, z), this.top);
  }

  rotate({ x = 0, y = 0, z = 0 }: { x?: number; y?: number; z?: number }) {
    twgl.m4.rotateX(this.top, x, this.top);
    twgl.m4.rotateY(this.top, y, this.top);
    twgl.m4.rotateZ(this.top, z, this.top);
  }
}
