import * as twgl from "twgl.js";

class Light {
  ambient: twgl.v3.Vec3;
  diffuse: twgl.v3.Vec3;
  specular: twgl.v3.Vec3;
}

export class DirectionalLight extends Light {
  direction: twgl.v3.Vec3;
  constructor(
    amb: twgl.v3.Vec3,
    dif: twgl.v3.Vec3,
    spec: twgl.v3.Vec3,
    direction: twgl.v3.Vec3
  ) {
    super();
    this.ambient = amb;
    this.diffuse = dif;
    this.specular = spec;
    this.direction = direction;
  }

  setUniforms(prog: twgl.ProgramInfo) {
    const base = "dirLight.";
    const props = ["ambient", "diffuse", "specular", "direction"];
    const uniforms = props.reduce((uniforms, prop) => {
      uniforms[base + prop] = this[prop];
      return uniforms;
    }, {});
    twgl.setUniforms(prog, uniforms);
  }
}
