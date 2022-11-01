/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/


class PointShader {
    static vertexShader = 
        `
        uniform float pointsize;
        uniform bool enableRGBColorSpace;

        varying vec3 vColor;
        varying vec3 vNormal;
        attribute vec3 color;

        void main() {
            vColor = color;
            vNormal = normal;

            vec3 pos = vec3(position.xyz);

            if(enableRGBColorSpace) {
                pos = vec3(color.rgb) * 4.0;
            }

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0 );
            gl_PointSize = pointsize;
        }
        `

    static fragmentShader =
        `
        uniform bool enableNormalColor;

        varying vec3 vColor;
        varying vec3 vNormal;

        void main() {
            if(enableNormalColor) {
                gl_FragColor = vec4(abs(normalize(vNormal.xyz)), 1);
            }
            else {
                gl_FragColor = vec4(vColor.rgb, 1);
            }
        }     
        `
}

export default PointShader
