precision highp float;

attribute vec3 position;
attribute vec2 uv;
uniform mat4 worldViewProjection;
uniform float time;
uniform float trailLength;

varying vec2 vUV;
varying float vTrailPos;

void main() {
    vec3 newPosition = position;

    // World Position Offset: Élargir le trail à l'extrémité
    float trailPos = uv.y; // uv.y va de 0 (début) à 1 (fin du trail)
    float widthFactor = trailPos * 0.5; // Élargir vers la fin
    newPosition.x += newPosition.x * widthFactor;

    gl_Position = worldViewProjection * vec4(newPosition, 1.0);
    vUV = uv;
    vTrailPos = trailPos;
}