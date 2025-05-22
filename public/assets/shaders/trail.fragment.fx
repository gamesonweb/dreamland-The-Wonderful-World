precision highp float;

varying vec2 vUV;
varying float vTrailPos;
uniform sampler2D noiseTexture;
uniform sampler2D gradientTexture;
uniform float time;

void main() {
    // UV Distortion pour un mouvement fluide
    vec2 distortedUV = vUV;
    distortedUV.x += sin(time * 0.5 + vUV.y * 10.0) * 0.05; // Distorsion sinusoidale
    distortedUV.y += time * 0.2; // Défilement vertical

    // Noise texture pour les highlights
    vec4 noise = texture2D(noiseTexture, distortedUV);
    float highlight = pow(noise.r, 3.0) * 2.0; // Power et Multiply pour augmenter le contraste

    // Color mapping avec gradient
    vec4 gradientColor = texture2D(gradientTexture, vec2(highlight, 0.0));

    // Ajuster l'opacité en fonction de la position dans le trail
    float alpha = 1.0 - vTrailPos; // Plus transparent vers la fin
    gl_FragColor = vec4(gradientColor.rgb, gradientColor.a * alpha);
}