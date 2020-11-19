#version 300 es

in vec3 position;
in vec4 color;
in float scale;
uniform mat4 P;
uniform mat4 M;
uniform mat4 V;

out vec4 partCol;


void main()
{
	// Billboarding: set the upper 3x3 to be the identity matrix
	mat4 M0 = M;

	M0[0] = vec4(1.0, 0.0, 0.0, 0.0);
	M0[1] = vec4(0.0, 1.0, 0.0, 0.0);
	M0[2] = vec4(0.0, 0.0, 1.0, 0.0);

	gl_Position = P *V* M0 * vec4(position.xyz, 1.0);
	gl_PointSize= scale;

	partCol = color;
}


