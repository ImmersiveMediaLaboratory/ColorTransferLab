/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
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
            vUv = uv; // Weitergeben der Texturkoordinaten
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `
    
    static fragmentShader =
        `
        uniform sampler2D uTexture; // Hinzufügen der Textur als Uniform
        varying vec3 vColor;
        varying vec2 vUv; // Empfangen der Texturkoordinaten

        void main() {
            vec4 texColor = texture(uTexture, vUv); // Abtasten der Textur
            vec3 color = mix(pow(texColor.rgb, vec3(0.41666)) * 1.055 - vec3(0.055), texColor.rgb * 12.92, vec3(lessThanEqual(texColor.rgb, vec3(0.0031308))));
            gl_FragColor = vec4(color.rgb, 1.0); // Kombinieren der Texturfarbe mit der berechneten Farbe
        }
        `
}

export default MeshShader