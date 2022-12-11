/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/


class ColorDistributionShader {
    static vertexShader = 
        `
        uniform float pointsize;
        varying vec3 vColor;
        attribute vec3 color;

        void main() {
            vColor = color;

            vec3 pos = vec3(position.xyz);

            vec4 re = vec4( mix( pow( vColor.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), vColor.rgb * 12.92, vec3( lessThanEqual( vColor.rgb, vec3( 0.0031308 ) ) ) ), 1.0 );
            pos = vec3(re.rgb) * 4.0;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0 );
            gl_PointSize = pointsize;
        }
        `

    static fragmentShader =
        `
        varying vec3 vColor;
        varying vec3 vNormal;

        void main() {
            // LinearTosRGB encoding
            gl_FragColor = vec4( mix( pow( vColor.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), vColor.rgb * 12.92, vec3( lessThanEqual( vColor.rgb, vec3( 0.0031308 ) ) ) ), 1.0 );

        }     
        `
}

export default ColorDistributionShader
