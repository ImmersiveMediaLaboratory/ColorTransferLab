import React, {Suspense, useMemo, useRef, useEffect, useState, useCallback} from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { useLoader, useFrame } from "@react-three/fiber";
import SystemConfiguration from 'settings/SystemConfiguration';
import * as THREE from "three";
import $ from 'jquery';


const TriangleMesh = (props) => {
    console.log(props.file_name)
    //const [objd, setObj] = useState(null)
    let objd = null
    const [loaded, setLoaded] = useState(0)
    const [center, setCenter] = useState([0,0,0])
    const [scaling, setScaling] = useState(1.0)
    const [complete, setComplete] = useState(false)


    useEffect(() => {
        const loader = new OBJLoader();
        // load a resource
        loader.load(
            // resource URL
            //process.env.PUBLIC_URL + '/' + props.file_name +'.obj',
            props.file_name +'.obj',
            // called when resource is loaded
            function ( object ) {
                const mtlLoader = new MTLLoader();
                mtlLoader.load(
                    //process.env.PUBLIC_URL + '/' + props.file_name +'.mtl',
                    props.file_name +'.mtl',
                    function (mtl) {
                        //setObj(object)
                        objd = object

                        mtl.preload();

                        SystemConfiguration.mesh = object.children[0]

                        if(!Array.isArray(objd.children[0].material)) {
                            if(objd.children[0].material.map == null) {
                                objd.children[0].material = mtl.materials[objd.children[0].material.name];
                                objd.children[0].material.map_temp = mtl.materials[objd.children[0].material.name].map
                                objd.children[0].material.map_null = new THREE.TextureLoader().load(window.location.href + "/assets/template_texture.png")
                            }

                            SystemConfiguration.material = objd.children[0].material
                            SystemConfiguration.material.specular = {r:0,g:0,b:0}
                            SystemConfiguration.material.wireframe = false
                            SystemConfiguration.material.map = SystemConfiguration.material.map_temp
                            SystemConfiguration.material.color = {r: 1.0, g: 1.0, b: 1.0}
                            SystemConfiguration.material.transparent = false
                            SystemConfiguration.material.opacity = 1.0
                            SystemConfiguration.material.side = THREE.FrontSide


                        } else {
                            SystemConfiguration.material = []
                            for(var i = 0; i < objd.children[0].material.length; i++){
                                // if map is null, the mesh was loaded the first time
                                if(objd.children[0].material[i].map == null) {
                                    objd.children[0].material[i] = mtl.materials[objd.children[0].material[i].name];
                                    objd.children[0].material[i].map_temp = mtl.materials[objd.children[0].material[i].name].map
                                    objd.children[0].material[i].map_null = new THREE.TextureLoader().load(window.location.href + "/assets/template_texture.png")
                                }

                                var matName = objd.children[0].material[i].name
                                objd.children[0].material[i] = mtl.materials[matName]
                                objd.children[0].material[i].specular = {r:0,g:0,b:0}

                                SystemConfiguration.material.push(objd.children[0].material[i])

                                SystemConfiguration.material[i].wireframe = false
                                SystemConfiguration.material[i].map = SystemConfiguration.material[i].map_temp
                                SystemConfiguration.material[i].color = {r: 1.0, g: 1.0, b: 1.0}
                                SystemConfiguration.material[i].needsUpdate = true
                                SystemConfiguration.material[i].transparent = false
                                SystemConfiguration.material[i].opacity = 1.0
                                SystemConfiguration.material[i].side = THREE.FrontSide
                            }
                            SystemConfiguration.material = objd.children[0].material
                        }

                        object.children[0].geometry.computeBoundingSphere();
                        var center = object.children[0].geometry.boundingSphere.center
                        var radius = object.children[0].geometry.boundingSphere.radius
                        var scaling = 1.0 / radius
                        setCenter(center)
                        setScaling(scaling)

                        // Resets the progress bar after loading is complete
                        $(`#${props.renderBar}`).css("width", "0%")
                        setComplete(true)
                        props.setGLOComplete(Math.random())
                    }
                )   
            },
            // called when loading is in progresses
            function ( xhr ) {
                var progress = ( xhr.loaded / xhr.total * 100 );
                //setLoaded(progress)calc(100% - 2px)
                $(`#${props.renderBar}`).css("width", progress.toString() + "%")
                //$("#rightpanel_statusbar").css("width", "calc(" + progress.toString() + "% - 2px)")
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

            },
            // called when loading has errors
            function ( error ) {
                console.log(error)
                console.log( 'An error happened' );

            }
        );
    //}, [props.file_name])
        console.log("useEffect")
    }, [])


    if(!complete) {
        return (
            <group position={[0,0,0]} scale={1}/>
        )
    } else {
        return (
            <group position={[-center.x*scaling, -center.y*scaling + 1.0, -center.z*scaling]} scale={scaling}>
                <mesh geometry={SystemConfiguration.mesh.geometry} material={SystemConfiguration.mesh.material} dispose={null}/>  
            </group>
        )
    }
}

export default TriangleMesh;