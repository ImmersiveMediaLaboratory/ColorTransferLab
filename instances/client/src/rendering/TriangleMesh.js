/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, {Suspense, useMemo, useRef, useEffect, useState, forwardRef, useImperativeHandle} from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { useLoader, useFrame } from "@react-three/fiber";
import SystemConfiguration from 'settings/SystemConfiguration';
import * as THREE from "three";
import { TextureLoader, BufferAttribute } from 'three';
import { updateHistogram } from 'Utils/Utils';

import $ from 'jquery';
import MeshShader from 'shader/MeshShader.js';
import TempShader from 'shader/TempShader.js';


/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************
 ******************************************************************************************************************/
 const TriangleMesh = forwardRef((props, ref) => {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
     const [state, setState] = useState({
        wireframe: false,
        colordistribution: false,
        faceNormals: false,
        info: {
            "#Vertices": 0,
            "#Faces": 0
        }
    });

    const [textureloaded, setTextureloaded] = useState(false)
    // const [center, setCenter] = useState([0,0,0])
    // const [scaling, setScaling] = useState(1.0)
    const [complete, setComplete] = useState(false)

    const [mesh, setMesh] = useState(null)

    const histogram3D = useRef([]);
    let center = useRef(new THREE.Vector3(0,0,0))
    let scaling = useRef(1.0)

    const refTriangleMesh = useRef()

    // const coords = useRef(new BufferAttribute(new Float32Array([1.0,1.0,1.0]), 3));
    // const normals = useRef(new Float32Array(0))
    //const colors = useRef(new BufferAttribute(new Float32Array([1.0,0.0,1.0]), 3));
    const colors = useRef(new Float32Array(0))

    const refPoints = useRef()

    const vertexShader = MeshShader.vertexShader
    const fragmentShader = MeshShader.fragmentShader
    
    const vertexPointShader = TempShader.vertexShader
    const fragmentPointShader = TempShader.fragmentShader

    const [pmaterial, setPmaterial] = useState(null)

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useImperativeHandle(ref, () => ({
        getState() {
            return state;
        },
        updateState(newState) {
            setState(prevState => ({
                ...prevState,
                ...newState,
            }));
        },
    }));

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useFrame(() => {
        if(refTriangleMesh.current) {
            refTriangleMesh.current.material.wireframe = state.wireframe
            refTriangleMesh.current.material.uniforms.faceNormal = {value: state.faceNormal}
            refTriangleMesh.current.material.uniforms.enableColorDistribution = {value: state.colordistribution}
        }
        // if(refPoints.current) {
        //     refPoints.current.material.uniforms.pointsize = {value: state.pointsize}
        //     refPoints.current.material.uniforms.enableNormalColor = {value: state.colornormal}
        //     refPoints.current.material.uniforms.enableColorDistribution = {value: state.colordistribution}
        // }
    })

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        loadModel(props.file_name, props);
    }, []);

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    let dataX = useMemo(
        () => ({
          uniforms: {
            Ka: { value: new THREE.Vector3(1, 1, 1) },
            Kd: { value: new THREE.Vector3(1, 1, 1) },
            Ks: { value: new THREE.Vector3(1, 1, 1) },
            LightIntensity: { value: new THREE.Vector4(0.5, 0.5, 0.5, 1.0) },
            LightIntensity: { value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) },
            LightPosition: { value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0) },
            Shininess: { value: 1.0 },
            enableNormalColor: { value: false },
            enableColorDistribution: { value: true },
            pointsize: { value: 1.0 }
          },
          vertexShader:vertexPointShader,
          fragmentShader:fragmentPointShader,
          
        }),
        []
    )

    const dataX2 = useMemo(
        () => ({
            uniforms: {},
            vertexShader: `
                varying vec3 vColor;

                void main() {
                    vColor = vec3(0.0, 0.0, 1.0); // Blau
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = 10.0; // Punktgröße 10
                }
            `,
            fragmentShader: `
                varying vec3 vColor;

                void main() {
                    gl_FragColor = vec4(vColor, 1.0);
                }
            `,
        }),
        []
    );

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
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
    
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
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

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
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
                wireframe: state.wireframe
            });

            // const PshaderMaterial = new THREE.ShaderMaterial({
            //     vertexPointShader,
            //     fragmentPointShader,
            // });
            // setPmaterial(PshaderMaterial)
    
            let currMesh = obj.children[0];
            currMesh.material = shaderMaterial;
    
            setMesh(currMesh);
    
            obj.children[0].geometry.computeBoundingSphere();
            var cen= obj.children[0].geometry.boundingSphere.center;
            var radius = obj.children[0].geometry.boundingSphere.radius;
            var sca = 1.0 / radius;
            center.current = [-cen.x*sca, -cen.y*sca + 1.0, -cen.z*sca];
            scaling.current = sca;
            // setCenter(center);
            // setScaling(scaling);



            const textureUrl = fileName + '.png';
            loadTextureAndConvertToArray(textureUrl, (pixelArray) => {

                // set the histogram data for 2D and 3D rendering
                const histograms = calculateColorHistograms(pixelArray, false, 4)
                const { mean, stdDev } = calculateMeanAndStdDev(pixelArray, false, 4);
                const histogram2D = histograms[0]
                histogram3D.current = histograms[1]
                updateHistogram(histogram2D, mean, stdDev, props.view)

                let colors_buf = new Float32Array(pixelArray)
                // Entfernen jedes vierten Wertes aus colors_buf und Teilen der verbleibenden Werte durch 255
                const filteredColorsBuf = colors_buf
                    .filter((_, index) => (index + 1) % 4 !== 0)
                    .map(value => value / 255);



                colors.current = new BufferAttribute(new Float32Array(filteredColorsBuf), 3);
                //console.log(colors.current)

                setTextureloaded(true)
 
            });

            // Update the info field
            setState(prevState => ({
                ...prevState,
                info: {
                    ...prevState.info,
                    "#Faces": obj.children[0].geometry.attributes.position.count / 3,
                    "#Vertices": (obj.children[0].geometry.attributes.position.count / 3 / 2) + 2
                }
            }));

            // Resets the progress bar after loading is complete
            $(`#${props.renderBar}`).css("width", "0%");
            setComplete(true);
            props.setGLOComplete(Math.random());
        } catch (error) {
            console.error('An error happened', error);
        }
    };


    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    // Function to load a texture and convert it into an array
    function loadTextureAndConvertToArray(url, callback) {
        console.log('Loading texture:', url);
        const loader = new TextureLoader();
        loader.load(
            url,
            (texture) => {
                // Create a canvas element
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                // Set the canvas size to the texture size
                canvas.width = texture.image.width;
                canvas.height = texture.image.height;

                // Draw the texture onto the canvas
                context.drawImage(texture.image, 0, 0);

                // Extract the pixel data from the canvas
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const pixelArray = imageData.data;

                // Call the callback function with the pixel array
                callback(pixelArray);
            },
            undefined,
            (error) => {
                console.error('Error loading texture:', error);
            }
        );
    }
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    function calculateMeanAndStdDev(colorsArray, normalized, channels) {
        let scale = 1
        if(normalized)
            scale = 255

        const r = [], g = [], b = [];
        for (let i = 0; i < colorsArray.length; i += channels) {
            const rValue = colorsArray[i] * scale;
            const gValue = colorsArray[i + 1] * scale;
            const bValue = colorsArray[i + 2] * scale;
 
            if (!isNaN(rValue) && !isNaN(gValue) && !isNaN(bValue)) {
                r.push(rValue);
                g.push(gValue);
                b.push(bValue);
            }
        }
    
        const calculateStats = (array) => {
            const sum = array.reduce((acc, value) => acc + value, 0);
            const mean = Math.round(sum / array.length);
    
            const squaredDifferences = array.map(value => Math.pow(value - mean, 2));
            const meanSquaredDifference = squaredDifferences.reduce((acc, value) => acc + value, 0) / array.length;
            const stdDev = Math.round(Math.sqrt(meanSquaredDifference));
    
            return { mean, stdDev };
        };
    
        const rStats = calculateStats(r);
        const gStats = calculateStats(g);
        const bStats = calculateStats(b);
    
        return {
            mean: [rStats.mean, gStats.mean, bStats.mean],
            stdDev: [rStats.stdDev, gStats.stdDev, bStats.stdDev]
        };
    }
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const calculateColorHistograms = (colorsArray, normalized, channels) => {
        // create a histogram of colors for rendering in the histogram tab of the console
        const histogram = new Array(256).fill(null).map(() => new Array(3).fill(0));
        // Initialisieren Sie ein 3D-Array für die Bins
        const bins = new Array(10).fill(null).map(() => 
            new Array(10).fill(null).map(() => 
                new Array(10).fill(0)
            )
        );

        let scale = 1
        if(normalized)
            scale = 255

        // Initialisieren Sie eine Variable für den maximalen Wert
        let maxValue = 0;
        for (let i = 0; i < colorsArray.length; i += channels) {
            const r = Math.min(Math.max(Math.round(colorsArray[i] * scale), 0), 255);
            const g = Math.min(Math.max(Math.round(colorsArray[i+1] * scale), 0), 255);
            const b = Math.min(Math.max(Math.round(colorsArray[i+2] * scale), 0), 255);
            if (isNaN(r) || isNaN(g) || isNaN(b))
                continue

            histogram[r][0]++;
            histogram[g][1]++;
            histogram[b][2]++;

            // Bestimmen Sie die Bin-Indizes
            const rBin = Math.min(Math.floor(colorsArray[i] * 10), 9);
            const gBin = Math.min(Math.floor(colorsArray[i+1] * 10), 9);
            const bBin = Math.min(Math.floor(colorsArray[i+2] * 10), 9);

            // Erhöhen Sie die Zählung für das entsprechende Bin
            bins[rBin][gBin][bBin]++;
            if (bins[rBin][gBin][bBin] > maxValue) {
                maxValue = bins[rBin][gBin][bBin];
            }
        }

        // volume of largest sphere
        let maxVolume = 4/3 * Math.PI * Math.pow(0.5, 3)
        let spheres = []
        
        for (let r = 0; r < 10; r++) {
            for (let g = 0; g < 10; g++) {
                for (let b = 0; b < 10; b++) {
                    if (bins[r][g][b] > 0) {
                        const color = new THREE.Color(r / 10 + 0.05, g / 10 + 0.05, b / 10 + 0.05);


                        // 0.05 is added to the color values to place the sphere in the center of the bin
                        // Each bin has a size of 0.1.
                        const position = new THREE.Vector3((r / 10 + 0.05) * 4, (g / 10 + 0.05) * 4, (b / 10 + 0.05) * 4) ;
                        // caluculate radius of sphere based on the scaled volume of the sphere
                        const radius = Math.pow(bins[r][g][b] / maxValue  * maxVolume / Math.PI * 3/4, 1/3);
                        const scale = Math.max(radius / 10 * 4 * 2, 0.05)//bins[r][g][b] / maxValue / 10 * 4; // Skalierung, damit die größte Kugel das gesamte Bin ausfüllt

                        spheres.push(
                            <mesh key={`${r}-${g}-${b}`} position={position} scale={[scale, scale, scale]}>
                                <sphereGeometry args={[0.5, 32, 32]} />
                                <meshStandardMaterial color={color} />
                            </mesh>
                        );
                    }
                }
            }
        }

        return [histogram, spheres];
    }
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

    console.log(dataX)

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    console.log(colors.current)
    if(!complete || !textureloaded) {
        return (
            <group position={[0,0,0]} scale={1}/>
        )
    } else {
        return (
            <>
                {state.colordistribution ? (
                    <points
                        key={Math.random} 
                        ref={refPoints} 
                    >
                        <bufferGeometry>
                            <bufferAttribute attach={"attributes-position"} {...colors.current} />
                            <bufferAttribute attach={"attributes-color"} {...colors.current} />
                        </bufferGeometry>
                        <shaderMaterial attach="material" args={[dataX]} />
                    </points>) : (
                    <group position={center.current} scale={scaling.current}>
                        {mesh && mesh.geometry && mesh.material && (
                            <mesh ref={refTriangleMesh} geometry={mesh.geometry} material={mesh.material} dispose={null} />
                        )}
                    </group>
                )}
            </>
        )
    } 
})

export default TriangleMesh;