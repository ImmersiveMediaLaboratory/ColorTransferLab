/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/


class MeshShader {
    static vertexShader = 
        `
        varying vec3 vColor;
        varying vec2 vUv;

        void main() {
            vColor = position;
            vUv = uv; // Forwarding the texture coordinates
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `
    
    static fragmentShader =
        `
        uniform sampler2D uTexture; // Adding a texture uniform
        varying vec3 vColor;
        varying vec2 vUv; // Receiving the texture coordinates

        void main() {
            vec4 texColor = texture(uTexture, vUv);
            vec3 color = mix(pow(texColor.rgb, vec3(0.41666)) * 1.055 - vec3(0.055), texColor.rgb * 12.92, vec3(lessThanEqual(texColor.rgb, vec3(0.0031308))));
            gl_FragColor = vec4(color.rgb, 1.0);
        }
        `
}

export default MeshShader