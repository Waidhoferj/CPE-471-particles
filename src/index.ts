import meshVert from "../resources/mesh.vert";
import meshFrag from "../resources/mesh.frag";
import particleVert from "../resources/particle.vert";
import particleFrag from "../resources/particle.frag";
import particleAlpha from "../resources/alpha.bmp";
import naturePath from "../resources/nature.obj";
import cubePath from "../resources/cube.obj";

import dat from "dat.gui";
import * as OBJ from "webgl-obj-loader";
import * as twgl from "twgl.js";
import ParticleSystem from "./ParticleSystem";
import MatrixStack from "./MatrixStack";
import { DirectionalLight } from "./Light";
import Material from "./Material";
const { m4, v3 } = twgl;

const settings: SimulationSettings = {
  numParticles: 40,
  dHue: 15,
  dSaturation: 15,
  dBrightness: 15,
  dLifespan: 500,
  baseColor: "#a6ed8f",
  lifespan: 4000,
  damping: 0.9,
  baseMass: 1.2,
  dMass: 0,
  dScale: 8,
  baseScale: 24,
  ambient: 0.3,
  diffuse: 0.6,
  specular: 0.5,
  curl: 1,
  gravity: 0,
  graduallySpawn: true,
  spawnInterval: 0.2,
};

const camera = {
  zoom: -20,
  rotation: 1,
};

const canvas = document.getElementById("scene") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2");
if (!gl) document.querySelector(".error-overlay").classList.remove("hide");
const sim = new ParticleSystem(settings, gl);
const gui = createGui(settings);
const particleTexture = twgl.createTexture(gl, {
  src: particleAlpha,
  mag: gl.NEAREST,
});
const materials = {
  tree: new Material(
    v3.create(0.3, 0.4225, 0.3),
    v3.create(0.44, 0.7, 0.43),
    v3.create(0.516228, 0.616228, 0.616228),
    30
  ),
  ground: new Material(
    v3.create(0.4, 0.3, 0.4),
    v3.create(0.6, 0.4118, 0.3),
    v3.create(0.8, 0.4, 0.3),
    70
  ),
};

let light = new DirectionalLight(
  v3.create(settings.ambient, settings.ambient, settings.ambient),
  v3.create(settings.diffuse, settings.diffuse, settings.diffuse),
  v3.create(settings.specular, settings.specular, settings.specular),
  v3.create(0, -1, 1)
);
const meshProgram = twgl.createProgramInfo(gl, [meshVert, meshFrag]);
const particleProgram = twgl.createProgramInfo(gl, [
  particleVert,
  particleFrag,
]);
let treeAttrBuffer: twgl.BufferInfo;
let groundAttrBuffer: twgl.BufferInfo;

async function loadMesh(path: string): Promise<OBJ.Mesh> {
  const objData: string = await fetch(path).then((res) => res.text());
  return new OBJ.Mesh(objData);
}

function bindEvents() {
  const orbit = (e: KeyboardEvent) => {
    const step = 0.5;
    switch (e.key) {
      case "w":
        camera.zoom += step;
        break;
      case "s":
        camera.zoom -= step;
        break;
      case "a":
        camera.rotation -= step;
        break;
      case "d":
        camera.rotation += step;
        break;

      default:
        break;
    }
  };

  window.addEventListener("keydown", orbit);
}

function render(time: number) {
  twgl.resizeCanvasToDisplaySize(canvas);
  const P = new MatrixStack();
  const V = new MatrixStack();
  const M = new MatrixStack();
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  m4.perspective(5.0, gl.canvas.width / gl.canvas.height, 0.01, 100.0, P.top);

  m4.translate(V.top, v3.create(0, 0, camera.zoom), V.top);
  m4.rotateY(V.top, camera.rotation, V.top);

  gl.useProgram(meshProgram.program);
  light.setUniforms(meshProgram);
  M.push();
  M.translate(-5, 7, -3.5);
  M.rotate({ x: -Math.PI });
  twgl.setUniforms(meshProgram, { P: P.top, V: V.top, M: M.top });
  materials.tree.setUniforms(meshProgram);
  twgl.setBuffersAndAttributes(gl, meshProgram, treeAttrBuffer);
  twgl.drawBufferInfo(gl, treeAttrBuffer);
  M.pop();
  M.push();
  M.translate(0, 7, -4);
  M.scale(200, 0.4, 200);
  twgl.setUniforms(meshProgram, {
    P: P.top,
    V: V.top,
    M: M.top,
  });

  materials.ground.setUniforms(meshProgram);
  twgl.setBuffersAndAttributes(gl, meshProgram, groundAttrBuffer);
  twgl.drawBufferInfo(gl, groundAttrBuffer);
  M.pop();
  gl.useProgram(particleProgram.program);
  const particleUniforms = {
    P: P.top,
    V: V.top,
    M: M.top,
    alphaTexture: particleTexture,
  };
  twgl.setUniforms(particleProgram, particleUniforms);
  sim.update(time, gl, V.top);
  sim.draw(gl, particleProgram);

  requestAnimationFrame(render);
}

function getInverseTransform(attrs: MeshAttributes): twgl.v3.Vec3 {
  // TODO: some research into format is in order;
  return twgl.v3.create(0, 0, 0);
}

async function init() {
  let natureGeometry = await loadMesh(naturePath);
  let cubeGeometry = await loadMesh(cubePath);

  const treeAttrs = {
    position: natureGeometry.vertices,
    normal: natureGeometry.vertexNormals,
    indices: [
      ...natureGeometry.indicesPerMaterial[2],
      ...natureGeometry.indicesPerMaterial[3],
    ],
  };
  const cubeAttrs = {
    position: cubeGeometry.vertices,
    normal: cubeGeometry.vertexNormals,
    indices: cubeGeometry.indices,
  };
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0.12, 0.34, 0.56, 1);
  treeAttrBuffer = twgl.createBufferInfoFromArrays(gl, treeAttrs);
  groundAttrBuffer = twgl.createBufferInfoFromArrays(gl, cubeAttrs);
  bindEvents();
  requestAnimationFrame(render);
}

function createGui(settings: SimulationSettings) {
  let gui = new dat.GUI();
  gui
    .add(settings, "numParticles", 1, 300, 1)
    .onChange((e) => sim.refresh(gl, settings));
  gui
    .add(settings, "damping", 0, 1, 0.01)
    .onChange((e) => sim.refresh(gl, settings));
  const particleProps = gui.addFolder("Particle Props");
  const deltas = gui.addFolder("Particle Deltas");
  const lighting = gui.addFolder("Lighting");
  const forces = gui.addFolder("Forces");

  deltas.add(settings, "dHue", 0, 180);
  deltas.add(settings, "dSaturation", 0, 50);
  deltas.add(settings, "dBrightness", 0, 50);
  deltas.add(settings, "dMass", 0, 10, 0.01);
  deltas.add(settings, "dScale", 0, 20, 0.01);
  deltas.add(settings, "dLifespan", 0, 10000);
  deltas.__controllers.forEach((c) =>
    c.onChange((e) => sim.refresh(gl, settings))
  );

  particleProps.addColor(settings, "baseColor");
  particleProps.add(settings, "lifespan", 0, 10000);
  particleProps.add(settings, "baseMass", 1, 20);
  particleProps.add(settings, "baseScale", 5, 50);
  particleProps.add(settings, "spawnInterval", 0.01, 5, 0.1);
  particleProps.add(settings, "graduallySpawn");
  particleProps.__controllers.forEach((c) =>
    c.onChange((e) => sim.refresh(gl, settings))
  );
  const createLight = () =>
    (light = new DirectionalLight(
      v3.create(settings.ambient, settings.ambient, settings.ambient),
      v3.create(settings.diffuse, settings.diffuse, settings.diffuse),
      v3.create(settings.specular, settings.specular, settings.specular),
      v3.create(-1, -1, -1)
    ));
  lighting.add(settings, "ambient", 0, 1, 0.01);
  lighting.add(settings, "diffuse", 0, 1, 0.01);
  lighting.add(settings, "specular", 0, 1, 0.01);
  lighting.__controllers.forEach((c) => c.onChange(createLight));

  forces.add(settings, "curl", 0, 5, 0.1);
  forces.add(settings, "gravity", 0, 1, 0.1);

  forces.__controllers.forEach((c) =>
    c.onChange((e) => sim.refresh(gl, settings))
  );

  return gui;
}

init();
