import * as twgl from "twgl.js";

export default class Material {
  ambient: twgl.v3.Vec3;
  diffuse: twgl.v3.Vec3;
  specular: twgl.v3.Vec3;
  shine: number;

  constructor(
    ambient: twgl.v3.Vec3,
    diffuse: twgl.v3.Vec3,
    specular: twgl.v3.Vec3,
    shine: number
  ) {
    this.ambient = ambient;
    this.diffuse = diffuse;
    this.specular = specular;
    this.shine = shine;
  }
  setUniforms(prog: twgl.ProgramInfo) {
    const uniforms = {
      MatAmb: this.ambient,
      MatDif: this.diffuse,
      MatSpec: this.specular,
      shine: this.shine,
    };
    twgl.setUniforms(prog, uniforms);
  }
}
