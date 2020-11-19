#version 300 es

in vec4 position;
in vec3 normal;
uniform mat4 P;
uniform mat4 V;
uniform mat4 M;
out vec3 fragNor;
out vec3 Vv;
out vec3 Wpos;

void main()
{
  gl_Position = P * V * M * position;
Wpos = (V * M * position).xyz;
fragNor = normalize((V * M * vec4(normal, 0.0)).xyz);
	
Vv = normalize(- Wpos);
}
