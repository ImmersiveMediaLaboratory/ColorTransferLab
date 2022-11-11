/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, {Suspense, useMemo, useRef, useEffect, useState} from 'react';
import { useLoader, useFrame } from "@react-three/fiber";
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import * as THREE from 'three'
import PointShader from "shader/PointShader"
const vertexShader = PointShader.vertexShader
const fragmentShader = PointShader.fragmentShader


/*************************************************************************************************************
* - creates three colored axes for visualizing the coordinatesystem's axes
* - the axes are shifted a little in y direction to prevent overlapping with the grid
*************************************************************************************************************/
function PointCloud(props) {
    var setting_pointsize = document.getElementById('settings_pointsize')
    const [pointsize, changePointsize] = useState(setting_pointsize.value)
    const change_pointsize = (event) => {
        changePointsize(event.target.value)
    }


    var setting_colornormal = document.getElementById('settings_colornormal')
    const [colornormal, changeColornormal] = useState(setting_colornormal.checked)
    const change_colornormal = (event) => {
        changeColornormal(event.target.checked)
    }

    var setting_rgbcolorspace = document.getElementById('settings_rgbcolorspace')
    const [rgbcolorspace, changeRgbcolorspace] = useState(setting_rgbcolorspace.checked)
    const change_rgbcolorspace = (event) => {
        changeRgbcolorspace(event.target.checked)
    }


    useEffect(() => {
      var setting_pointsize = document.getElementById('settings_pointsize')
      setting_pointsize.addEventListener("change", change_pointsize);

      var setting_colornormal = document.getElementById('settings_colornormal')
      setting_colornormal.addEventListener("change", change_colornormal);

      var setting_rgbcolorspace = document.getElementById('settings_rgbcolorspace')
      setting_rgbcolorspace.addEventListener("change", change_rgbcolorspace);

      return () => {
        var setting_pointsize = document.getElementById('settings_pointsize')
        setting_pointsize.removeEventListener("change", change_pointsize);

        var setting_colornormal = document.getElementById('settings_colornormal')
        setting_colornormal.removeEventListener("change", change_colornormal);

        var setting_rgbcolorspace = document.getElementById('settings_rgbcolorspace')
        setting_rgbcolorspace.removeEventListener("change", change_rgbcolorspace);
    }
    }, []);


    let ref = useRef()
    useFrame(() => {
        ref.current.material.uniforms.pointsize = {value: pointsize}
        ref.current.material.uniforms.enableNormalColor = {value: colornormal}
        ref.current.material.uniforms.enableRGBColorSpace = {value: rgbcolorspace}
    })

    let data = useMemo(
        () => ({
          uniforms: {
            Ka: { value: new THREE.Vector3(1, 1, 1) },
            Kd: { value: new THREE.Vector3(1, 1, 1) },
            Ks: { value: new THREE.Vector3(1, 1, 1) },
            LightIntensity: { value: new THREE.Vector4(0.5, 0.5, 0.5, 1.0) },
            LightPosition: { value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0) },
            Shininess: { value: 200.0 }
          },
          fragmentShader,
          vertexShader
        }),
        []
    )

    var obj = useLoader(PLYLoader, props.file_path)
    let coords = new Float32Array(obj.attributes.position.array)
    let normals = new Float32Array(obj.attributes.normal.array)
    let colors = new Float32Array(obj.attributes.color.array)

    if(props.from_image) {
        var canvas = document.createElement('canvas');
        // TODO: Number of vertices in 3D histogram has to be scaled properly 
        canvas.width = props.image.width / 2
        canvas.height = props.image.height / 2
        // {willReadFrequently:true} removes the warning "Canvas2D: Multiple readback operations using getImageData are faster with the willReadFrequently attribute set to true."
        var context = canvas.getContext('2d', {willReadFrequently:true});
        context.drawImage(props.image, 0, 0);

        const vv = new Float32Array(canvas.width * canvas.height * 3);
        const nn = new Float32Array(canvas.width * canvas.height * 3);
        const cc = new Float32Array(canvas.width * canvas.height * 3);

        var count = 0
        for(var i = 0; i < canvas.height; i++) 
        {
            for(var j = 0; j < canvas.width; j++) 
            {
                var pxData = context.getImageData(j, i, 2, 2).data
                vv[count] = pxData[0] / 255.0
                vv[count+1] = pxData[1]/ 255.0
                vv[count+2] = pxData[2]/ 255.0

                nn[count] = 1.0
                nn[count+1] = 0.0
                nn[count+2] = 0.0

                cc[count] = pxData[0] / 255.0
                cc[count+1] = pxData[1]/ 255.0
                cc[count+2] = pxData[2]/ 255.0
                count += 3
            }
        }

        obj.setAttribute( 'position', new THREE.BufferAttribute( vv, 3 ) );
        obj.setAttribute( 'normal', new THREE.BufferAttribute( nn, 3 ) );
        obj.setAttribute( 'color', new THREE.BufferAttribute( cc, 3 ) );


        coords = new Float32Array(obj.attributes.position.array)
        normals = new Float32Array(obj.attributes.normal.array)
        colors = new Float32Array(obj.attributes.color.array)
    }

    return(
        <points key={Math.random} ref={ref}>
             <bufferGeometry>
                 <bufferAttribute attachObject={["attributes", "position"]} count={coords.length / 3} array={coords} itemSize={3} />
                 <bufferAttribute attachObject={["attributes", "normal"]} count={normals.length / 3} array={normals} itemSize={3} />
                 <bufferAttribute attachObject={["attributes", "color"]} count={colors.length / 3} array={colors} itemSize={3} />
             </bufferGeometry>
             <shaderMaterial attach="material" {...data} />
       </points>
    );
}

export default PointCloud;
