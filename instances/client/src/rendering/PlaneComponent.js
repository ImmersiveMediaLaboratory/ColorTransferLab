import {useRef, useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import LightFieldShader from "shader/LightFieldShader.js";

// Vertex and Fragment shaders
const vertexShader = LightFieldShader.vertexShader
const fragmentShader = LightFieldShader.fragmentShader


const PlaneComponent = ({ camsX, camsY, width, height, cameraGap, fieldTexture, aperture, focus, stInput }) => {
    const planeRef = useRef();
    const planePtsRef = useRef();
    const {scene} = useThree();

    useEffect(() => {
        if(fieldTexture !== null) {
            const planeGeo = new THREE.PlaneGeometry(camsX * cameraGap, camsY * cameraGap, camsX, camsY);

            const planeMat = new THREE.ShaderMaterial({
                uniforms: {
                aspect: { value: height / width },
                field: { value: fieldTexture },
                camArraySize: new THREE.Uniform(new THREE.Vector2(camsX, camsY)),
                aperture: { value: aperture },
                focus: { value: focus }
                },
                vertexShader,
                fragmentShader,
            });

            const plane = new THREE.Mesh(planeGeo, planeMat);
            // the plane is square, so we need to scale it to the correct aspect ratio
            planeRef.current = plane;

            const ptsMat = new THREE.PointsMaterial({ size: 0.01, color: 0xeeccff });
            const planePts = new THREE.Points(planeGeo, ptsMat);
  
            planePts.visible = stInput;
            planePtsRef.current = planePts;

            plane.add(planePts);
            scene.add(plane);
            
            return () => {
                scene.remove(plane);
            };
        }

    }, [camsX, camsY, cameraGap, fieldTexture, aperture, focus, stInput, scene]);

    return null;
};

export default PlaneComponent;