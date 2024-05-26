import React, {Suspense, useMemo, useRef, useEffect, useState, useCallback} from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { useLoader, useFrame } from "@react-three/fiber";
import SystemConfiguration from 'settings/SystemConfiguration';
import * as THREE from "three";


function TriangleMesh (props){

    const [wireframeEnabled, setWireframeEnabled] = useState(false)

    // var objd = useLoader(OBJLoader, process.env.PUBLIC_URL + '/' + props.file_name +'.obj')
    // var mtl = useLoader(MTLLoader, process.env.PUBLIC_URL + '/' + props.file_name +'.mtl')
    // console.log(props.file_name)
    var objd = useLoader(OBJLoader, props.file_name +'.obj')
    var mtl = useLoader(MTLLoader, props.file_name +'.mtl')
    mtl.preload()



    SystemConfiguration.mesh = objd.children[0]

    //console.log(objd.children[0])


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


    }
    else {
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

    objd.children[0].geometry.computeBoundingSphere();
    //console.log(objd.children[0].geometry.boundingSphere)
    var center = objd.children[0].geometry.boundingSphere.center
    var radius = objd.children[0].geometry.boundingSphere.radius
    var scaling = 1.0 / radius

    return (
        <group position={[-center.x*scaling, -center.y*scaling + 1.0, -center.z*scaling]} scale={scaling}>
            <mesh geometry={objd.children[0].geometry} material={objd.children[0].material} dispose={null}/>  
        </group>
    );


}

export default TriangleMesh;