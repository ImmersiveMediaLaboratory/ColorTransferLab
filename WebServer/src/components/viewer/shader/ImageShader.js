/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

export default class ImageShader {
    static fragmentShader = 
        `
        #define MAX_CLASSES 8

        uniform sampler2D u_image;
        uniform sampler2D u_semantic;
        uniform vec3 u_targetColor[MAX_CLASSES];
        uniform vec3 u_mod_hsb[MAX_CLASSES]; // hue, saturation, brightness

        varying vec2 vUv;

        // Hilfsfunktion für Farbvergleich
        bool colorMatch(vec3 a, vec3 b) {
            return all(lessThan(abs(a - b), vec3(0.5)));
        }

        // RGB -> HSV
        vec3 rgb2hsv(vec3 c) {
            vec4 K = vec4(0., -1./3., 2./3., -1.);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
            float d = q.x - min(q.w, q.y);
            float e = 1e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6. * d + e)), d / (q.x + e), q.x);
        }

        // HSV -> RGB
        vec3 hsv2rgb(vec3 c) {
            vec4 K = vec4(1., 2./3., 1./3., 3.);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6. - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0., 1.), c.y);
        }

        void main() {
            vec4 color = texture2D(u_image, vUv);
            vec3 sem = texture2D(u_semantic, vUv).rgb * 255.0;

            for (int i = 0; i < MAX_CLASSES; ++i) {
                if (colorMatch(sem, u_targetColor[i])) {
                    vec3 hsv = rgb2hsv(color.rgb);
                    hsv.x = mod(hsv.x + u_mod_hsb[i].x / 360.0, 1.0);
                    hsv.y *= u_mod_hsb[i].y / 100.0;
                    hsv.z *= u_mod_hsb[i].z / 100.0;
                    color.rgb = hsv2rgb(hsv);
                }
            }
            gl_FragColor = color;
        }
        `
}