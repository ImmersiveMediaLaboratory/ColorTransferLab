/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, {Suspense, useMemo, useRef, useEffect, useState, useCallback} from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { useLoader, useFrame } from "@react-three/fiber";
import SystemConfiguration from 'settings/SystemConfiguration';
import * as THREE from "three";
import $ from 'jquery';
import MeshShader from 'shader/MeshShader.js';

const vertexShader = MeshShader.vertexShader
const fragmentShader = MeshShader.fragmentShader

const TriangleMesh = (props) => {
    console.log(props.file_name)
    const [loaded, setLoaded] = useState(0)
    const [center, setCenter] = useState([0,0,0])
    const [scaling, setScaling] = useState(1.0)
    const [complete, setComplete] = useState(false)

    const [mesh, setMesh] = useState(null)
    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const loadMTL = (fileName) => {
        return new Promise((resolve, reject) => {
            const mtlLoader = new MTLLoader();
            mtlLoader.load(
                fileName + '.mtl',
                (mtl) => {
                    mtl.preload();
                    resolve(mtl);
                },
                undefined,
                (error) => {
                    reject(error);
                }
            );
        });
    };
    
    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const loadOBJ = (fileName) => {
        return new Promise((resolve, reject) => {
            const objLoader = new OBJLoader();
            objLoader.load(
                fileName + '.obj',
                (obj) => {
                    resolve(obj);
                },
                undefined,
                (error) => {
                    reject(error);
                }
            );
        });
    };

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const loadModel = async (fileName, props) => {
        try {
            console.log(fileName)
            const [mtl, obj] = await Promise.all([loadMTL(fileName), loadOBJ(fileName)]);
    
            // Set the material to the OBJ model
            obj.traverse((child) => {
                if (child.isMesh) {
                    child.material = mtl.materials[child.material.name];
                }
            });


            const shaderMaterial = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uTexture: { value: obj.children[0].material.map }
                },
                //wireframe: true, // Setzen des wireframe-Attributs auf true
            });
    
            let currMesh = obj.children[0];
            currMesh.material = shaderMaterial;
    
            setMesh(currMesh);
    
            obj.children[0].geometry.computeBoundingSphere();
            var center = obj.children[0].geometry.boundingSphere.center;
            var radius = obj.children[0].geometry.boundingSphere.radius;
            var scaling = 1.0 / radius;
            setCenter(center);
            setScaling(scaling);
    
            // Resets the progress bar after loading is complete
            $(`#${props.renderBar}`).css("width", "0%");
            setComplete(true);
            props.setGLOComplete(Math.random());
        } catch (error) {
            console.error('An error happened', error);
        }
    };

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    useEffect(() => {
        if(mesh != null) {
            console.log("HEHEH")
            console.log(mesh.material)
        } else {}
    }, [mesh])

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    useEffect(() => {
        loadModel(props.file_name, props);
    }, []);



    // useEffect(() => {
    //     const loader = new OBJLoader();
    //     // load a resource
    //     loader.load(
    //         // resource URL
    //         props.file_name +'.obj',
    //         // called when resource is loaded
    //         function ( objd ) {
    //             const mtlLoader = new MTLLoader();
    //             mtlLoader.load(
    //                 props.file_name +'.mtl',
    //                 function (mtl) {
    //                     mtl.preload();

    //                     const shaderMaterial = new THREE.ShaderMaterial({
    //                         vertexShader,
    //                         fragmentShader,
    //                         uniforms: {
    //                             uTexture: {value: objd.children[0].material.map}
    //                         },
    //                         //wireframe: true,
    //                     });

    //                     let currMesh = objd.children[0] 
    //                     currMesh.material = shaderMaterial

    //                     setMesh(currMesh)

    //                     //setMaterial(shaderMaterial)

    //                     // SystemConfiguration.mesh = objd.children[0]

    //                     // if(!Array.isArray(objd.children[0].material)) {
    //                     //     if(objd.children[0].material.map == null) {
    //                     //         objd.children[0].material = mtl.materials[objd.children[0].material.name];
    //                     //         objd.children[0].material.map_temp = mtl.materials[objd.children[0].material.name].map
    //                     //         objd.children[0].material.map_null = new THREE.TextureLoader().load(window.location.href + "/assets/template_texture.png")
    //                     //     }

    //                     //     //shaderMaterial.map.color = {r: 1.0, g: 1.0, b: 1.0}

    //                     //     console.log(objd.children[0].material)

    //                     //     SystemConfiguration.material = objd.children[0].material
    //                     //     SystemConfiguration.material.specular = {r:0,g:0,b:0}
    //                     //     SystemConfiguration.material.wireframe = false
    //                     //     SystemConfiguration.material.map = SystemConfiguration.material.map_temp
    //                     //     SystemConfiguration.material.color = {r: 1.0, g: 1.0, b: 1.0}
    //                     //     SystemConfiguration.material.transparent = false
    //                     //     SystemConfiguration.material.opacity = 1.0
    //                     //     SystemConfiguration.material.side = THREE.FrontSide

    //                     //     console.log(SystemConfiguration.material.map)
    //                     //     const shaderMaterial = new THREE.ShaderMaterial({
    //                     //         vertexShader,
    //                     //         fragmentShader,
    //                     //         uniforms: {
    //                     //             uTexture: {value: objd.children[0].material.map}
    //                     //         },
    //                     //         wireframe: true,
    //                     //     });
    
    //                     //     setMaterial(shaderMaterial)


    //                     //     shaderMaterial.map = SystemConfiguration.material.map
    //                     //     console.log(shaderMaterial)


    //                     // } else {
    //                     //     SystemConfiguration.material = []
    //                     //     for(var i = 0; i < objd.children[0].material.length; i++){
    //                     //         // if map is null, the mesh was loaded the first time
    //                     //         if(objd.children[0].material[i].map == null) {
    //                     //             objd.children[0].material[i] = mtl.materials[objd.children[0].material[i].name];
    //                     //             objd.children[0].material[i].map_temp = mtl.materials[objd.children[0].material[i].name].map
    //                     //             objd.children[0].material[i].map_null = new THREE.TextureLoader().load(window.location.href + "/assets/template_texture.png")
    //                     //         }

    //                     //         var matName = objd.children[0].material[i].name
    //                     //         objd.children[0].material[i] = mtl.materials[matName]
    //                     //         objd.children[0].material[i].specular = {r:0,g:0,b:0}

    //                     //         SystemConfiguration.material.push(objd.children[0].material[i])

    //                     //         SystemConfiguration.material[i].wireframe = false
    //                     //         SystemConfiguration.material[i].map = SystemConfiguration.material[i].map_temp
    //                     //         SystemConfiguration.material[i].color = {r: 1.0, g: 1.0, b: 1.0}
    //                     //         SystemConfiguration.material[i].needsUpdate = true
    //                     //         SystemConfiguration.material[i].transparent = false
    //                     //         SystemConfiguration.material[i].opacity = 1.0
    //                     //         SystemConfiguration.material[i].side = THREE.FrontSide
    //                     //     }
    //                     //     SystemConfiguration.material = objd.children[0].material
    //                     // }

    //                     objd.children[0].geometry.computeBoundingSphere();
    //                     var center = objd.children[0].geometry.boundingSphere.center
    //                     var radius = objd.children[0].geometry.boundingSphere.radius
    //                     var scaling = 1.0 / radius
    //                     setCenter(center)
    //                     setScaling(scaling)

    //                     // Resets the progress bar after loading is complete
    //                     $(`#${props.renderBar}`).css("width", "0%")
    //                     setComplete(true)
    //                     props.setGLOComplete(Math.random())
    //                 }
    //             )   
    //         },
    //         // called when loading is in progresses
    //         function ( xhr ) {
    //             var progress = ( xhr.loaded / xhr.total * 100 );
    //             //setLoaded(progress)calc(100% - 2px)
    //             $(`#${props.renderBar}`).css("width", progress.toString() + "%")
    //             //$("#rightpanel_statusbar").css("width", "calc(" + progress.toString() + "% - 2px)")
    //             console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    //         },
    //         // called when loading has errors
    //         function ( error ) {
    //             console.log(error)
    //             console.log( 'An error happened' );

    //         }
    //     );
    // }, [])

    return (
        <group position={[-center.x*scaling, -center.y*scaling + 1.0, -center.z*scaling]} scale={scaling}>
            {mesh && mesh.geometry && mesh.material && (
                    <mesh geometry={mesh.geometry} material={mesh.material} dispose={null}/>
                )}
        </group>
    )
}

export default TriangleMesh;