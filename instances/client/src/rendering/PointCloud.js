/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

/*
Reference for point cloud rendering: https://codesandbox.io/p/sandbox/points-ldpyw8?file=%2Fsrc%2Findex.js%3A14%2C12-14%2C56
*/

import React, {Suspense, useMemo, useRef, useEffect, useState} from 'react';
import { BufferAttribute } from "three";
import { useLoader, useFrame } from "@react-three/fiber";
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import * as THREE from 'three'
import PointShader from "shader/PointShader"
import SysConf from "settings/SystemConfiguration"
import $ from 'jquery';
const vertexShader = PointShader.vertexShader
const fragmentShader = PointShader.fragmentShader


/*************************************************************************************************************
* - creates three colored axes for visualizing the coordinatesystem's axes
* - the axes are shifted a little in y direction to prevent overlapping with the grid
*************************************************************************************************************/
function PointCloud(props) {

    const [complete, setComplete] = useState(false)

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
            // var setting_pointsize = document.getElementById('settings_pointsize')
            // setting_pointsize.removeEventListener("change", change_pointsize);

            // var setting_colornormal = document.getElementById('settings_colornormal')
            // setting_colornormal.removeEventListener("change", change_colornormal);
        }
    }, []);


    let ref = useRef()
    useFrame(() => {
        if(complete) {
            ref.current.material.uniforms.pointsize = {value: pointsize}
            ref.current.material.uniforms.enableNormalColor = {value: colornormal}

        }
    })

    let data = useMemo(
        () => ({
          uniforms: {
            Ka: { value: new THREE.Vector3(1, 1, 1) },
            Kd: { value: new THREE.Vector3(1, 1, 1) },
            Ks: { value: new THREE.Vector3(1, 1, 1) },
            LightIntensity: { value: new THREE.Vector4(0.5, 0.5, 0.5, 1.0) },
            LightIntensity: { value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) },
            LightPosition: { value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0) },
            Shininess: { value: 1.0 }
          },
          vertexShader,
          fragmentShader
          
        }),
        []
    )

    let coords = useRef(new Float32Array(0))

    let normals = useRef(new Float32Array(0))
    let colors = useRef(new Float32Array(0))
    let position = useRef(new THREE.Vector3(0,0,0))
    let scaling = useRef(1.0)
    let center = useRef(new THREE.Vector3(0,0,0))

    console.log(process.env.PUBLIC_URL + '/' + props.file_path)
    console.log(process.env.PUBLIC_URL)
    console.log(props.file_path)

    useEffect(() => {
        const loader = new PLYLoader();
        // load a resource
        loader.load(
            // resource URL
            //process.env.PUBLIC_URL + '/' + props.file_path,
            props.file_path,
            // called when resource is loaded
            function ( obj ) {
                // calculate scaling factor to fit object into unit cube
                var boundingBox = new THREE.Box3();
                obj.computeBoundingBox();
                boundingBox.copy( obj.boundingBox );
            
                center.current = new THREE.Vector3(boundingBox.min.x + (boundingBox.max.x - boundingBox.min.x ) / 2.0, 
                                               boundingBox.min.y + (boundingBox.max.y - boundingBox.min.y ) / 2.0, 
                                               boundingBox.min.z + (boundingBox.max.z - boundingBox.min.z ) / 2.0)
            
                var radius = (obj.boundingBox.max.y - obj.boundingBox.min.y ) / 2.0

                //props.center.current = center.current
                //props.scale.current = scaling
                
                position.current = new THREE.Vector3(-center.current.x*scaling.current, -center.current.y*scaling.current + 1.0, -center.current.z*scaling.current)
                scaling.current = 1.0 / radius

                let coord_buf = new Float32Array(obj.attributes.position.array)
                coords.current = new BufferAttribute(coord_buf, 3);

                let normals_buf = new Float32Array(obj.attributes.normal.array)
                normals.current = new BufferAttribute(normals_buf, 3);

                let colors_buf = new Float32Array(obj.attributes.color.array)
                colors.current = new BufferAttribute(colors_buf, 3);


                // Resets the progress bar after loading is complete
                $(`#${props.renderBar}`).css("width", "0%")
                setComplete(true)
                props.setGLOComplete(Math.random())
                
            },
            // called when loading is in progresses
            function ( xhr ) {
                var progress = ( xhr.loaded / xhr.total * 100 );
                //setLoaded(progress)calc(100% - 2px)
                $(`#${props.renderBar}`).css("width", progress.toString() + "%")
            },
            // called when loading has errors
            function ( error ) {
                console.log(error)
                console.log( 'An error happened' );

            }
        );
        console.log("useEffect")
    }, [])


    if(!complete) {
        return (
            <group position={[0,0,0]} scale={1}/>
        )
    } else {
        return(
            <points key={Math.random} ref={ref} position={position.current} scale={scaling.current}>
                 <bufferGeometry>
                     <bufferAttribute attach={"attributes-position"} {...coords.current} />
                     <bufferAttribute attach={"attributes-normal"} {...normals.current} />
                     <bufferAttribute attach={"attributes-color"} {...colors.current} />
                 </bufferGeometry>
                 <shaderMaterial attach="material" {...data} />
           </points>
        );
    }
}

export default PointCloud;
