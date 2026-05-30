/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import * as THREE from "three";
import {useEffect, useState, useRef, forwardRef} from 'react';
import {BufferAttribute} from 'three';
import {loadTextureAndConvertToArray, calculateColorHistograms, calculateMeanAndStdDev} from '@/Utils/Utils';
import ImageShader from '@/components/viewer/shader/ImageShader';
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { TextureLoader } from "three";
import { useSelection } from "@/contexts/SelectionContext";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D u_image;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(u_image, vUv);
    gl_FragColor = vec4(pow(c.rgb, vec3(1.0/2.2)), c.a);
  }
`;

function ImagePlane({ imageUrl, semanticUrl, fit = "contain" }) {
    const texture = useLoader(TextureLoader, imageUrl);
    const semanticTexture = useLoader(TextureLoader, semanticUrl);
    texture.colorSpace = THREE.SRGBColorSpace;   // three r152+
    semanticTexture.colorSpace = THREE.SRGBColorSpace;   // three r152+

    const { viewport } = useThree();

    const imgW = texture.image?.width ?? 1;
    const imgH = texture.image?.height ?? 1;
    const imgAspect = imgW / imgH;

    const viewW = viewport.width;
    const viewH = viewport.height;
    const viewAspect = viewW / viewH;

    // Choose plane size to satisfy "contain" or "cover" within the container
    let planeW, planeH;
    if (fit === "cover") {
        if (imgAspect > viewAspect) {
        planeH = viewH;
        planeW = viewH * imgAspect;
        } else {
        planeW = viewW;
        planeH = viewW / imgAspect;
        }
    } else {
        if (imgAspect > viewAspect) {
        planeW = viewW;
        planeH = viewW / imgAspect;
        } else {
        planeH = viewH;
        planeW = viewH * imgAspect;
        }
    }

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    return (
        <mesh scale={[planeW, planeH, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                uniforms={{ u_image: { value: texture } }}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
            />
        </mesh>
    );
}

export default function Image({rid, filePath, greyscaleEnabled, setObjInfo, modifications,semanticMaps}) {
    const [imagePath, setImagePath] = useState(null);
    const [canvasUrl, setCanvasUrl] = useState(null);
    const webglCanvasRef = useRef(null);

    const { setSelectedColorDistribution, setSelectedHistogram3D, setSelectedHistogram2D } = useSelection();

    useEffect(() => {
        setImagePath(filePath);
        setCanvasUrl(null); // Reset canvas URL when filePath changes
        if (filePath !== null) {
            const textureUrl = filePath;
            loadTextureAndConvertToArray(textureUrl, (pixelArray, width, height, channels) => {
                console.debug("%c[INFO] Creation of 2D and 3D Histograms", "color: orange;");
                const histograms = calculateColorHistograms(pixelArray, false, 4);
                const { mean, stdDev } = calculateMeanAndStdDev(pixelArray, false, 4);
                const histogram2D = histograms[0];

                
                let colors_buf = new Float32Array(pixelArray);
                const filteredColorsBuf = colors_buf
                    .filter((_, index) => (index + 1) % 4 !== 0)
                    .map(value => value / 255);

                const info = { width, height, channels };

                setObjInfo(info);

                setSelectedColorDistribution(prev => ({
                    ...(prev || {}),
                    [rid]: new BufferAttribute(new Float32Array(filteredColorsBuf), 3)
                }));

                setSelectedHistogram3D(prev => ({
                    ...(prev || {}),
                    [rid]: histograms[1]
                }));

                setSelectedHistogram2D(prev => ({
                    ...(prev || {}),
                    [rid]: { histogram: histogram2D, mean, stdDev }
                }));

            });
        }
    }, [filePath, rid]);

    // WebGL-based modificatio
    useEffect(() => {
        if (!filePath || !modifications) {
            setCanvasUrl(null);
            return;
        }

        // Fallback: Wenn keine Modifikationen → kein WebGL
        const mods = modifications || {};
        // Für jede Klasse prüfen, ob Modifikation vorhanden ist
        const classNames = Object.keys(mods).filter(
            k => mods[k] && mods[k].color && typeof mods[k].hue === "number"
        );
        if (
            !filePath ||
            !modifications ||
            classNames.length === 0
        ) {
            setCanvasUrl(null);
            return;
        }

        const img = new window.Image();
        img.crossOrigin = "Anonymous";
        img.src = filePath;
        img.onload = () => {
            const width = img.width;
            const height = img.height;
            let canvas = webglCanvasRef.current;
            if (!canvas) {
                canvas = document.createElement("canvas");
                webglCanvasRef.current = canvas;
            }
            canvas.width = width;
            canvas.height = height;

            // Prepare image data
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // Load semantic map if available and apply modifications based on it
            if (semanticMaps && semanticMaps.src) {
                const semImg = new window.Image();
                semImg.crossOrigin = "Anonymous";
                semImg.src = semanticMaps.src;

                semImg.onload = () => {
                    const semCanvas = document.createElement("canvas");
                    semCanvas.width = width;
                    semCanvas.height = height;
                    const semCtx = semCanvas.getContext("2d");
                    semCtx.drawImage(semImg, 0, 0, width, height);
                    const semData = semCtx.getImageData(0, 0, width, height).data;

                    // For each class: Create mask and apply shader
                    let imageData = ctx.getImageData(0, 0, width, height);
                    let data = imageData.data;

                    classNames.forEach(className => {
                        const mod = mods[className];
                        const hex = mod.color.replace("#", "");
                        const target = {
                            r: parseInt(hex.substring(0, 2), 16),
                            g: parseInt(hex.substring(2, 4), 16),
                            b: parseInt(hex.substring(4, 6), 16)
                        };

                        function normalizeHue(modHue) {
                            if (modHue < 0) {
                                return 1 + modHue; // Convert negative values to positive in range [0.5, 1] by adding 1
                            }
                            return modHue; // Return the original value if it is already in the range [0, 0.5]
                        }

                        // For all pixels, check if they belong to the class
                        for (let y = 0; y < height; ++y) {
                            for (let x = 0; x < width; ++x) {
                                const idx = (y * width + x) * 4;
                                const r = semData[idx];
                                const g = semData[idx + 1];
                                const b = semData[idx + 2];
                                if (r === target.r && g === target.g && b === target.b) {
                                    // 1. RGB -> HSV
                                    let rr = data[idx] / 255, gg = data[idx + 1] / 255, bb = data[idx + 2] / 255;
                                    let maxc = Math.max(rr, gg, bb), minc = Math.min(rr, gg, bb);
                                    let v = maxc, d = maxc - minc;
                                    let s = maxc === 0 ? 0 : d / maxc;
                                    let h = 0;
                                    if (d !== 0) {
                                        if (maxc === rr) {
                                            h = (gg - bb) / d;
                                        } else if (maxc === gg) {
                                            h = 2 + (bb - rr) / d;
                                        } else {
                                            h = 4 + (rr - gg) / d;
                                        }
                                        h = h / 6;
                                        if (h < 0) h += 1;
                                    }
                                    // 2. Apply modifications
                                    h = normalizeHue(h + ((mod.hue) / 360)) % 1;
                                    s = Math.max(0, Math.min(1, s * (mod.saturation / 100)));
                                    v = Math.max(0, Math.min(1, v * (mod.brightness / 100)));
                                    // 3. HSV -> RGB
                                    let i = Math.floor(h * 6);
                                    let f = h * 6 - i;
                                    let p = v * (1 - s);
                                    let q = v * (1 - s * f);
                                    let t = v * (1 - s * (1 - f));
                                    let r1, g1, b1;
                                    switch (i % 6) {
                                        case 0: r1 = v; g1 = t; b1 = p; break;
                                        case 1: r1 = q; g1 = v; b1 = p; break;
                                        case 2: r1 = p; g1 = v; b1 = t; break;
                                        case 3: r1 = p; g1 = q; b1 = v; break;
                                        case 4: r1 = t; g1 = p; b1 = v; break;
                                        case 5: r1 = v; g1 = p; b1 = q; break;
                                    }
                                    data[idx] = Math.round(r1 * 255);
                                    data[idx + 1] = Math.round(g1 * 255);
                                    data[idx + 2] = Math.round(b1 * 255);

                                    // Logic for bleeding effect to neighboring pixels of different classes
                                    const neighbors1 = [
                                        [0, -1], [0, 1], [-1, 0], [1, 0],
                                        [-1, -1], [1, -1], [-1, 1], [1, 1]
                                    ]; 
                                    // Distance 2 (16 additional pixels)
                                    const neighbors2 = [];
                                    for (let dx = -2; dx <= 2; dx++) {
                                        for (let dy = -2; dy <= 2; dy++) {
                                            if (Math.abs(dx) === 2 || Math.abs(dy) === 2) {
                                                if (!(dx === 0 && dy === 0)) neighbors2.push([dx, dy]);
                                            }
                                        }
                                    }
                                    const bleedFactor1 = mod.bleeding * 0.01 // * 0.2; // 20% Modification for direct neighbors
                                    const bleedFactor2 =  mod.bleeding * 0.01 / 2 //0.1; // 10% Modification for distance 2 neighbors
    
                                    for (const [dx, dy] of neighbors1) {
                                        const nx = x + dx;
                                        const ny = y + dy;
                                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                            const nidx = (ny * width + nx) * 4;
                                            const nr = semData[nidx];
                                            const ng = semData[nidx + 1];
                                            const nb = semData[nidx + 2];
                                            if (nr !== target.r || ng !== target.g || nb !== target.b) {
                                                // RGB -> HSV
                                                let nrr = data[nidx] / 255, ngg = data[nidx + 1] / 255, nbb = data[nidx + 2] / 255;
                                                let nmaxc = Math.max(nrr, ngg, nbb), nminc = Math.min(nrr, ngg, nbb);
                                                let nv = nmaxc, nd = nmaxc - nminc;
                                                let ns = nmaxc === 0 ? 0 : nd / nmaxc;
                                                let nh = 0;
                                                if (nd !== 0) {
                                                    if (nmaxc === nrr) {
                                                        nh = (ngg - nbb) / nd;
                                                    } else if (nmaxc === ngg) {
                                                        nh = 2 + (nbb - nrr) / nd;
                                                    } else {
                                                        nh = 4 + (nrr - ngg) / nd;
                                                    }
                                                    nh = nh / 6;
                                                    if (nh < 0) nh += 1;
                                                }
                                                nh = normalizeHue(nh + ((mod.hue * bleedFactor1) / 360)) % 1;
                                                ns = Math.max(0, Math.min(1, ns * (1 + ((mod.saturation/100 - 1) * bleedFactor1))));
                                                nv = Math.max(0, Math.min(1, nv * (1 + ((mod.brightness/100 - 1) * bleedFactor1))));
                                                let ni = Math.floor(nh * 6);
                                                let nf = nh * 6 - ni;
                                                let np = nv * (1 - ns);
                                                let nq = nv * (1 - ns * nf);
                                                let nt = nv * (1 - ns * (1 - nf));
                                                let nr1, ng1, nb1;
                                                switch (ni % 6) {
                                                    case 0: nr1 = nv; ng1 = nt; nb1 = np; break;
                                                    case 1: nr1 = nq; ng1 = nv; nb1 = np; break;
                                                    case 2: nr1 = np; ng1 = nv; nb1 = nt; break;
                                                    case 3: nr1 = np; ng1 = nq; nb1 = nv; break;
                                                    case 4: nr1 = nt; ng1 = np; nb1 = nv; break;
                                                    case 5: nr1 = nv; ng1 = np; nb1 = nq; break;
                                                }
                                                data[nidx] = Math.round(nr1 * 255);
                                                data[nidx + 1] = Math.round(ng1 * 255);
                                                data[nidx + 2] = Math.round(nb1 * 255);
                                            }
                                        }
                                    }
                                    // Neighbors with distance 2
                                    for (const [dx, dy] of neighbors2) {
                                        const nx = x + dx;
                                        const ny = y + dy;
                                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                            const nidx = (ny * width + nx) * 4;
                                            const nr = semData[nidx];
                                            const ng = semData[nidx + 1];
                                            const nb = semData[nidx + 2];
                                            if (nr !== target.r || ng !== target.g || nb !== target.b) {
                                                // RGB -> HSV
                                                let nrr = data[nidx] / 255, ngg = data[nidx + 1] / 255, nbb = data[nidx + 2] / 255;
                                                let nmaxc = Math.max(nrr, ngg, nbb), nminc = Math.min(nrr, ngg, nbb);
                                                let nv = nmaxc, nd = nmaxc - nminc;
                                                let ns = nmaxc === 0 ? 0 : nd / nmaxc;
                                                let nh = 0;
                                                if (nd !== 0) {
                                                    if (nmaxc === nrr) {
                                                        nh = (ngg - nbb) / nd;
                                                    } else if (nmaxc === ngg) {
                                                        nh = 2 + (nbb - nrr) / nd;
                                                    } else {
                                                        nh = 4 + (nrr - ngg) / nd;
                                                    }
                                                    nh = nh / 6;
                                                    if (nh < 0) nh += 1;
                                                }
                                                nh = normalizeHue(nh + ((mod.hue * bleedFactor2) / 360)) % 1;
                                                ns = Math.max(0, Math.min(1, ns * (1 + ((mod.saturation/100 - 1) * bleedFactor2))));
                                                nv = Math.max(0, Math.min(1, nv * (1 + ((mod.brightness/100 - 1) * bleedFactor2))));
                                                let ni = Math.floor(nh * 6);
                                                let nf = nh * 6 - ni;
                                                let np = nv * (1 - ns);
                                                let nq = nv * (1 - ns * nf);
                                                let nt = nv * (1 - ns * (1 - nf));
                                                let nr1, ng1, nb1;
                                                switch (ni % 6) {
                                                    case 0: nr1 = nv; ng1 = nt; nb1 = np; break;
                                                    case 1: nr1 = nq; ng1 = nv; nb1 = np; break;
                                                    case 2: nr1 = np; ng1 = nv; nb1 = nt; break;
                                                    case 3: nr1 = np; ng1 = nq; nb1 = nv; break;
                                                    case 4: nr1 = nt; ng1 = np; nb1 = nv; break;
                                                    case 5: nr1 = nv; ng1 = np; nb1 = nq; break;
                                                }
                                                data[nidx] = Math.round(nr1 * 255);
                                                data[nidx + 1] = Math.round(ng1 * 255);
                                                data[nidx + 2] = Math.round(nb1 * 255);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });

                    ctx.putImageData(imageData, 0, 0);
                    setCanvasUrl(canvas.toDataURL());
                };
                semImg.onerror = () => setCanvasUrl(null);
            }
        };

        img.onerror = () => setCanvasUrl(null);
    }, [filePath, modifications, semanticMaps]);

    return (
        <div
            style={{
                overflow: "hidden", 
                position: "absolute",
                width: "100%", 
                height: "calc(100% - 25px)", 
                backgroundColor: "black",
                display: "block"
            }}
        >
            {modifications && canvasUrl ? (
                <img 
                    className="Xrenderer_image_inner"
                    src={canvasUrl}
                />
            ) : (
                <img 
                    className="Xrenderer_image_inner"
                    src={imagePath}
                    style={greyscaleEnabled ? { filter: 'grayscale(100%)' } : {}}
                />
            )}
            {/* <div id={innerid} className="renderer_image_inner">
                <Canvas orthographic camera={{ position: [0, 0, 2], zoom: 1 }} gl={{ outputColorSpace: THREE.SRGBColorSpace }}>
                    <ImagePlane imageUrl={imagePath} semanticUrl={semanticMaps?.src} fit="contain" />
                </Canvas>
            </div> */}
        </div>
    );
}