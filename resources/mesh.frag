#version 300 es
precision highp float;

struct DirectionalLight {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
	vec3 direction;
};

in vec3 fragNor;
in vec3 Vv;
in vec3 Wpos;
uniform DirectionalLight dirLight;
uniform vec3 MatAmb;
uniform mat4 V;
uniform vec3 MatDif;
uniform vec3 MatSpec;
uniform float shine;
out vec4 color;


vec3 applyDirectionalLight(DirectionalLight light, vec3 fragPos, vec3 Vv) {
	vec3 lightDirection = normalize((V * vec4(-light.direction,0.0)).xyz);
	vec3 halfVector = normalize(lightDirection + Vv);
	vec3 diffuse = MatDif * max(0.0, dot(fragNor,lightDirection)) * light.diffuse;
	vec3 specular = MatSpec * pow(max(0.0,dot(halfVector, fragNor)), shine) * light.specular;
	vec3 ambient = MatAmb * light.ambient;
	
	return diffuse + ambient + specular;
}

void main()
{
	vec3 Ncolor = applyDirectionalLight(dirLight, Wpos, Vv);
	color = vec4(Ncolor, 1.0);
}
