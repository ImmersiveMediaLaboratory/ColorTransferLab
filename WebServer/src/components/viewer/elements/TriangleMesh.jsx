/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import {useRef, useEffect, useState} from 'react';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader'
import {useFrame} from "@react-three/fiber";
import * as THREE from "three";
import {BufferAttribute} from 'three';
import {calculateColorHistograms, calculateMeanAndStdDev, loadTextureAndConvertToArray} from '@/Utils/Utils';
import MeshShader from '../shader/MeshShader.js';
import { useSelection } from "@/contexts/SelectionContext";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************
 ******************************************************************************************************************/
 export default function TriangleMesh({rid, fileBlobURL, index=0, currentIndex=0, setObjInfo, setMeshTexture, showFaceNormals, showWireframe}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /* ------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [textureloaded, setTextureloaded] = useState(false)
    const [complete, setComplete] = useState(false)
    const [mesh, setMesh] = useState(null)

    /* ------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const center = useRef(new THREE.Vector3(0,0,0))
    const scaling = useRef(1.0)
    const refTriangleMesh = useRef()
    const textureURL = useRef(fileBlobURL[0]);
    const colorDistribution = useRef(null);
    const histogram3D = useRef(null);
    const histogram2D = useRef(null);
    const mean = useRef([0,0,0]);
    const stdDev = useRef([0,0,0]);

    /* ------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const { setSelectedColorDistribution, setSelectedHistogram3D, setSelectedHistogram2D } = useSelection();

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Update the mesh properties when the showWireframe or showFaceNormals props change.
     **************************************************************************************************************/
    useFrame(() => {
        if(refTriangleMesh.current) {
            refTriangleMesh.current.material.wireframe = showWireframe
            refTriangleMesh.current.material.uniforms.faceNormal = {value: showFaceNormals}
        }
    })

    /**************************************************************************************************************
     * Load the model when the fileBlobURL changes.
     **************************************************************************************************************/
    useEffect(() => {
        loadModel(fileBlobURL);
    }, [fileBlobURL]);

    /**************************************************************************************************************
     * Update the selected color distribution and histograms when the currentIndex changes to the index of this mesh.
     **************************************************************************************************************/
    useEffect(() => {
        if (index === currentIndex) {

            setMeshTexture(prev => ({
                ...(prev || {}),
                [rid]: textureURL.current
            }));
            //
            setSelectedColorDistribution(prev => ({
                ...(prev || {}),
                [rid]: colorDistribution.current
            }));
            //
            setSelectedHistogram3D(prev => ({
                ...(prev || {}),
                [rid]: histogram3D.current
            }));

            setSelectedHistogram2D(prev => ({
                ...(prev || {}),
                [rid]: { histogram: histogram2D.current, mean, stdDev }
            }));
        }
    }, [currentIndex]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * Loads the MTL file.
     **************************************************************************************************************/
    const loadMTL = (fileName, png_urlname) => {
        return new Promise((resolve, reject) => {
            const mtlLoader = new MTLLoader();
            mtlLoader.load(
                fileName,
                (mtl) => {
                    const mapName = Object.keys(mtl.materialsInfo)[0];
                    if (mapName && mtl.materialsInfo[mapName]) {
                        mtl.materialsInfo[mapName].map_kd = png_urlname;
                    }
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

    /**************************************************************************************************************
     * Loads the OBJ file and applies the MTL materials if available.
     **************************************************************************************************************/
    const loadOBJ = (fileName, mtl) => {
        return new Promise((resolve, reject) => {
            const objLoader = new OBJLoader();
            if (mtl) {
                objLoader.setMaterials(mtl);
            }
            objLoader.load(
                fileName,
                (obj) => {
                    resolve(obj);
                    window.dispatchEvent(new CustomEvent("webrtc:loadingProgress", {
                        detail: {
                            rid: rid,
                            status: "end",
                            progress: 100
                        }
                    }));
                },
                (xhr) => {
                    window.dispatchEvent(new CustomEvent("webrtc:loadingProgress", {
                        detail: {
                            rid: rid,
                            status: "progress",
                            progress: ( xhr.loaded / xhr.total * 100 )
                        }
                    }));
                },
                (error) => {
                    reject(error);
                }
            );
        });
    };

    /**************************************************************************************************************
     * Loads the model, extracts the first mesh, applies the shader material, computes the bounding sphere for 
     * centering and scaling, loads the texture and computes the color distribution and histograms.
     **************************************************************************************************************/
    const loadModel = async (fileName) => {
        try {
            const png_urlname = fileName[0].split("/").pop();
            // 1) Load MTL
            const mtl = await loadMTL(fileName[1], png_urlname);
            // 2) Load OBJ with assigned materials
            const obj = await loadOBJ(fileName[2], mtl);

            // Get the first mesh instance from the object tree
            let currMesh = null;
            obj.traverse((child) => {
                if (child.isMesh && !currMesh) {
                    currMesh = child;
                }
            });

            if (!currMesh || !currMesh.material) {
                console.error("No mesh or material found in OBJ", obj);
                return;
            }

            const textureMap = currMesh.material.map || null;

            const shaderMaterial = new THREE.ShaderMaterial({
                vertexShader: MeshShader.vertexShader,
                fragmentShader: MeshShader.fragmentShader,
                uniforms: {
                    uTexture: { value: textureMap }
                },
                wireframe: showWireframe
            });

            currMesh.material = shaderMaterial;
            setMesh(currMesh);

            currMesh.geometry.computeBoundingSphere();
            const cen = currMesh.geometry.boundingSphere.center;
            const radius = currMesh.geometry.boundingSphere.radius;
            const sca = 1.0 / radius;
            center.current = [-cen.x * sca, -cen.y * sca + 1.0, -cen.z * sca];
            scaling.current = sca;

            const textureUrl = fileName[0];

            if (setMeshTexture) {
                setMeshTexture(prev => ({
                    ...(prev || {}),
                    [rid]: textureUrl
                }));
            }

            loadTextureAndConvertToArray(textureUrl, (pixelArray) => {
                // set the histogram data for 2D and 3D rendering
                const histograms = calculateColorHistograms(pixelArray, false, 4)
                const { mean, stdDev } = calculateMeanAndStdDev(pixelArray, false, 4);

                let colors_buf = new Float32Array(pixelArray)
                // Remove every fourth value from colors_buf and divide the remaining values by 255
                const filteredColorsBuf = colors_buf
                    .filter((_, index) => (index + 1) % 4 !== 0)
                    .map(value => value / 255);


                colorDistribution.current = new BufferAttribute(new Float32Array(filteredColorsBuf), 3);
                setSelectedColorDistribution(prev => ({
                    ...(prev || {}),
                    [rid]: colorDistribution.current
                }));

                histogram2D.current = histograms[0];
                mean.current = mean;
                stdDev.current = stdDev;
                setSelectedHistogram2D(prev => ({
                    ...(prev || {}),
                    [rid]: { histogram: histogram2D.current, mean: mean.current, stdDev: stdDev.current }
                }));

                histogram3D.current = histograms[1];
                setSelectedHistogram3D(prev => ({
                    ...(prev || {}),
                    [rid]: histogram3D.current
                }));

                setTextureloaded(true)
 
            });

            setObjInfo({
                "#Faces": currMesh.geometry.attributes.position.count / 3,
                "#Vertices":
                    currMesh.geometry.attributes.position.count / 3 / 2 + 2
            });

            setComplete(true);
        } catch (error) {
            console.debug("ERRO", 'An error happened: ', error );
        }
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return complete && textureloaded && mesh && mesh.geometry && mesh.material && (
        <mesh 
            position={center.current} 
            scale={scaling.current} 
            ref={refTriangleMesh} 
            geometry={mesh.geometry} 
            material={mesh.material} 
            dispose={null} 
        />
    );    
}