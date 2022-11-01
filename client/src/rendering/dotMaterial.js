import * as THREE from "three"
import { extend } from "@react-three/fiber"
import React, {Suspense, useMemo, useRef, useEffect} from 'react';

import SceneProperties from "settings/SceneProperties"

class DotMaterial extends THREE.ShaderMaterial {
    constructor() {
      super({
        transparent: true,
        uniforms: { time: { value: 1 } },
        vertexShader: `uniform float time;
        attribute float size;
        void main() {
          float PI = 3.1415926538;
          float x = position.x;
          float y = position.y;
          float z = position.z;
          float ROW = 50.;
          float COL = 50.;
          float NUM = ROW * COL;
          vec3 pos = vec3(x,y,z);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0 );
          gl_PointSize = 10.0;
        }`,
        fragmentShader: `uniform float time;
        void main() {
          gl_FragColor = vec4(vec3(1.,1.,1.), 1.);
        }`
      })
    }
  }
  
  extend({ DotMaterial })
  
