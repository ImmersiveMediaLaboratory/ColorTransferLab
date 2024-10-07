import "./GaussianSplatRenderer.scss"
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import * as THREE from 'three';
import React, { useRef, useEffect } from 'react';
import $ from 'jquery';

const GaussianSplatRenderer = (props) => {
    const containerRef = useRef(null);
    const renderer = useRef(null);
    const camera = useRef(null);
    const viewer = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Erstelle die Szene
        //const threeScene = new THREE.Scene();

        // Erstelle die Kamera
        camera.current = new THREE.PerspectiveCamera(65, width / height, 0.1, 500);
        camera.current.position.copy(new THREE.Vector3().fromArray([-3.15634, -0.16946, -0.51552]));
        camera.current.up = new THREE.Vector3().fromArray([0, -1, -0.54]).normalize();
        camera.current.lookAt(new THREE.Vector3().fromArray([1.52976, 2.27776, 1.65898]));

        // Erstelle den Renderer
        renderer.current = new THREE.WebGLRenderer({antialias: false});
        renderer.current.setSize(width, height);
        container.appendChild(renderer.current.domElement);


        // Erstelle den Viewer
        viewer.current = new GaussianSplats3D.Viewer({
            'renderer': renderer.current,
            "camera": camera.current,
            'sphericalHarmonicsDegree': 2,
            'sharedMemoryForWorkers': false,
        });

        // Bereinige den Renderer bei der Demontage der Komponente
        return () => {
            container.removeChild(renderer.current.domElement);
        };
    }, []);

    useEffect(() => {
        console.log("Filepath changed")
        console.log(props.filePath)
        if (props.filePath !== null) {

            let filePath = props.filePath.split(".")[0] + ".ksplat";
            viewer.current.removeSplatScene(0);

            waitForViewerToBeReady(viewer, () => {
                viewer.current.addSplatScene(filePath, {
                    "showLoadingUI": false,
                    onProgress: (progress) => {
                        //setLoaded(progress)calc(100% - 2px)
                        //$(`#${props.renderBar}`).css("width", progress.toString() + "%")
                        //$(`#${props.renderBar}`).css("width", "100%")
                        console.log(progress);
                    }})
                    .then(() => {
                        requestAnimationFrame(update);
                    });
            });

            function waitForViewerToBeReady(viewer, callback) {
                if (!viewer.current.isLoadingOrUnloading()) {
                    callback();
                    props.setComplete(Math.random())
                } else {
                    setTimeout(() => waitForViewerToBeReady(viewer, callback), 100); // Überprüfe alle 100ms
                }
            }
    
            function update() {
                requestAnimationFrame(update);
                renderer.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
                camera.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
                camera.current.updateProjectionMatrix();
                viewer.current.update();
                viewer.current.render();
            }
        }
    }, [props.filePath]);

    return(
        <div id={props.id} className="gaussianSplatRenderer" ref={containerRef}/>
    )

};

export default GaussianSplatRenderer;