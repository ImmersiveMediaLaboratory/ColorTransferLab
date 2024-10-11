/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/


class TempShader {
    static vertexShader = 
        `
        uniform float pointsize;
        attribute vec3 color;
        varying vec3 vColor;

        void main() {
            vColor = color;
            vec3 pos = color * 4.0;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0 );
            gl_PointSize = pointsize;
        }
        `
    static fragmentShader =
        `
        varying vec3 vColor;

        void main() {
            gl_FragColor = vec4( mix( pow( vColor.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), vColor.rgb * 12.92, vec3( lessThanEqual( vColor.rgb, vec3( 0.0031308 ) ) ) ), 1.0 );
        }     
        `

}

export default TempShader
