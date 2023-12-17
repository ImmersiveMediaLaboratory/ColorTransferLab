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
import SysConf from "settings/SystemConfiguration"
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

    useEffect(() => {
        var setting_pointsize = document.getElementById('settings_pointsize')
        setting_pointsize.addEventListener("change", change_pointsize);

        var setting_colornormal = document.getElementById('settings_colornormal')
        setting_colornormal.addEventListener("change", change_colornormal);

        return () => {
            var setting_pointsize = document.getElementById('settings_pointsize')
            setting_pointsize.removeEventListener("change", change_pointsize);

            var setting_colornormal = document.getElementById('settings_colornormal')
            setting_colornormal.removeEventListener("change", change_colornormal);
        }
    }, []);


    let ref = useRef()
    useFrame(() => {
        ref.current.material.uniforms.pointsize = {value: pointsize}
        ref.current.material.uniforms.enableNormalColor = {value: colornormal}
    })

    let data = useMemo(
        () => ({
          //uniforms: {
            // Ka: { value: new THREE.Vector3(1, 1, 1) },
            // Kd: { value: new THREE.Vector3(1, 1, 1) },
            // Ks: { value: new THREE.Vector3(1, 1, 1) },
            // LightIntensity: { value: new THREE.Vector4(0.5, 0.5, 0.5, 1.0) },
            //LightIntensity: { value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) },
            // LightPosition: { value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0) },
            // Shininess: { value: 1.0 }
          //},
          vertexShader,
          fragmentShader
          
        }),
        []
    )

    var obj = useLoader(PLYLoader, props.file_path)
    
    // calculate scaling factor to fit object into unit cube
    var boundingBox = new THREE.Box3();
    obj.computeBoundingBox();
    boundingBox.copy( obj.boundingBox );

    var cen = new THREE.Vector3(boundingBox.min.x + (boundingBox.max.x - boundingBox.min.x ) / 2.0, 
                                   boundingBox.min.y + (boundingBox.max.y - boundingBox.min.y ) / 2.0, 
                                   boundingBox.min.z + (boundingBox.max.z - boundingBox.min.z ) / 2.0)

    var radius = (obj.boundingBox.max.y - obj.boundingBox.min.y ) / 2.0
    var scaling = 1.0 / radius

    // SysConf.data_config[props.id]["pc_center"] = center
    // SysConf.data_config[props.id]["pc_scale"] = scaling
    props.center.current = cen
    props.scale.current = scaling
    

    var position = new THREE.Vector3(-cen.x*scaling, -cen.y*scaling + 1.0, -cen.z*scaling)
    var scaling = 1.0 / radius


    let coords = new Float32Array(obj.attributes.position.array)
    let normals = new Float32Array(obj.attributes.normal.array)
    let colors = new Float32Array(obj.attributes.color.array)

    return(
        <points key={Math.random} ref={ref} position={position} scale={scaling}>
             <bufferGeometry>
                 <bufferAttribute attachObject={["attributes", "position"]} count={coords.length / 3} array={coords} itemSize={3} />
                 <bufferAttribute attachObject={["attributes", "normal"]} count={normals.length / 3} array={normals} itemSize={3} />
                 <bufferAttribute attachObject={["attributes", "color"]} count={colors.length / 3} array={colors} itemSize={3} />
             </bufferGeometry>
             {/* <shaderMaterial attach="material" {...data} /> */}
             <shaderMaterial fragmentShader={fragmentShader} vertexShader={vertexShader} />
       </points>
    );
}

export default PointCloud;
