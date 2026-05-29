/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './Renderer.scss';
import { useState, useEffect, useRef} from 'react';
import JSZip from 'jszip';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import ImageRenderer from './ImageRenderer'
import VideoRenderer from './VideoRenderer'
import MeshRenderer from './MeshRenderer'
import LightFieldRenderer from './LightFieldRenderer'
import GaussianSplatRenderer from './GaussianSplatRenderer';
import ColorPalette from './ColorPalette';
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';
import RenderBar from './RenderBar';
import {useWebRTC} from '@/Utils/WebRTCProvider';
import { useSelection } from "@/contexts/SelectionContext";
import { getInitialValue } from "@/Utils/Utils.jsx";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** EXPORTED FUNCTIONS
 ******************************************************************************************************************
 ******************************************************************************************************************/

/**************************************************************************************************************
 * 
 **************************************************************************************************************/
export const active_reference = "Single Input"

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Renderer windows for (1) Source, (2) Reference and (3) Output
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Renderer({title, rid, filePath, setSettings, setMeshTexture, outputModifications, semanticMaps, activeDownload, setActiveDownload}){
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /* ------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    // stores information about the currently loaded object which is displayed in the info box of the data tab
    const [objInfo, setObjInfo] = useState({});

    let [filePath_LightField, setFilePath_LightField] = useState(null)
    let [filePath_GaussianSplat, setFilePath_GaussianSplat] = useState(null)
    let [filePath_Image, setFilePath_Image] = useState(null)
    let [filePath_Video, setFilePath_Video] = useState(null)
    let [filePath_Mesh, setFilePath_Mesh] = useState(null)

    const [downloadProgress, setDownloadProgress] = useState({ progress: 0, status: "end" });
    const [loadingProgress, setLoadingProgress] = useState({ progress: 0, status: "end" });

    let [fileName, setFileName] = useState("")

    const [colorPaletteEnabled, setColorPaletteEnabled] = useState(getInitialValue("Renderer:colorPaletteEnabled") ?? false);

    // stores the type of the currently loaded data (e.g. "Image", "Mesh", "PointCloud", "VolumetricVideo", "LightField" or "GaussianSplatting") for conditional rendering of the different renderers
    const [activeDataType, setActiveDataType] = useState(null)

    /* ------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    // Describes which data type is displayed
    // Possible values: ["", "Image", "PointCloud", "Mesh"]
    const mode = useRef("")
    const obj_path = useRef("xxx")

    /* ------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const {rtc} = useWebRTC();

    const { setSelectedSourcePath } = useSelection();
    const { setSelectedReferencePath } = useSelection();
    const { setSelectedOutputPath } = useSelection();

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Add event listener for the custom event "webrtc:file", which is emitted when a file is received via WebRTC.
     **************************************************************************************************************/
    useEffect(() => {
        function handler(e) {
            const data = e.detail;
            if (data.rid !== rid) return;
            handleRenderFile(data);
        }

        function handlerDownloadProgress(e) {
            const data = e.detail;
            if (data.rid !== rid) return;
            setDownloadProgress({ progress: data.progress, status: data.status });
        }

        function handlerLoadingProgress(e) {
            const data = e.detail;
            if (data.rid !== rid) return;
            setLoadingProgress({ progress: data.progress, status: data.status });
        }

        window.addEventListener("webrtc:file", handler);
        window.addEventListener("webrtc:downloadProgress", handlerDownloadProgress);
        window.addEventListener("webrtc:loadingProgress", handlerLoadingProgress);
        return () => {
            window.removeEventListener("webrtc:file", handler);
            window.removeEventListener("webrtc:downloadProgress", handlerDownloadProgress);
            window.removeEventListener("webrtc:loadingProgress", handlerLoadingProgress);
        };
    }, [rid]);

    /**************************************************************************************************************
     * If file is dropped on the renderer, updateRenderer will be called with the file path of the dropped file.
     **************************************************************************************************************/
    useEffect(() => {
        if(filePath !== null) {
            console.debug("INFO", `Update Renderer (${rid}) with new file path: ${filePath}`);

            if (rid === "src") {
                setSelectedSourcePath(filePath);
            } else if (rid === "ref") {
                setSelectedReferencePath(filePath);
            } else if (rid === "out") {
                setSelectedOutputPath(filePath);
            }

            var filePath_segments = filePath.split("/")
            var [file_name, file_ext] = filePath_segments[filePath_segments.length - 1].split(".")
            var file_name_with_ext = file_name + "." + file_ext
            var file_path = filePath_segments.slice(0, filePath_segments.length - 1).join("/")

            updateRenderer(file_path, file_name_with_ext)
        }
    }, [filePath]);

    /**************************************************************************************************************
     * Prints information about the currently loaded object in the info box of the data tab.
     **************************************************************************************************************/
    useEffect(() => {
        if (window.pushConsoleInfo) {           
            window.pushConsoleInfo(objInfo, rid);
        }
    }, [objInfo]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Handler for loading and displaying image files. Also requests the availability of semantics data for the 
     * loaded image.
     **************************************************************************************************************/
    function handleImage(value, abstr_file_path, rid, layer) {
        console.debug("INFO", 'Handling Image File');
        mode.current = "Image"

        // Value is already an Array of ArrayBuffers
        const receivedBlob = new Blob(value);
        const image_path = URL.createObjectURL(receivedBlob);

        setFilePath_Image(image_path)
        obj_path.current = abstr_file_path

        // Check if semantics data is available for this image
        const data_send = {
            command: "/file_availability",
            data: {
                "rid": rid,
                "abstractPath": abstr_file_path,
                "mode": "semantics"
            }
        };
        
        console.debug("SEND", '[Compute Node] Request semantics data availability via command /file_availability',  data_send);

        rtc.sendMessage(JSON.stringify(data_send))
    }

    /**************************************************************************************************************
     * Handler for loading and displaying video files.
     **************************************************************************************************************/
    function handleVideo(value, abstr_file_path) {
        console.debug("INFO", 'Handling Video File');
        mode.current = "Video"

        // Convert Array Buffer to Blob and then to URL Object
        const receivedBlob = new Blob(value);
        const video_path = URL.createObjectURL(receivedBlob);
        setFilePath_Video(video_path)
        obj_path.current = abstr_file_path
    }

    /**************************************************************************************************************
     * Handler for loading and displaying point cloud files.
     **************************************************************************************************************/
    function handlePointCloud(value, abstr_file_path) {
        console.debug("INFO", 'Handling PointCloud File');
        mode.current = "PointCloud"

        // Convert Array Buffer to Blob and then to URL Object
        const receivedBlob = new Blob(value);
        const filepath = URL.createObjectURL(receivedBlob);

        setFilePath_Mesh(filepath)
        obj_path.current = abstr_file_path
    }

    /**************************************************************************************************************
     * Handler for loading and displaying mesh files.
     **************************************************************************************************************/
    function handleMesh(value, abstr_file_path) {
        console.debug("INFO", 'Handling Mesh File');
        mode.current = "Mesh";

        // contains paths to the obj, png and the mtl file
        (async () => {
            try {
                let meshObj_paths = [];
    
                // New behavior: value represents a single ZIP file (possibly as array of chunks)
                const zipBlob = Array.isArray(value) ? new Blob(value) : new Blob([value]);

                const zip = await JSZip.loadAsync(zipBlob);

                // Collect all non-directory files
                const meshFiles = [];
                zip.forEach((relPath, file) => {
                    if (!file.dir) {
                        meshFiles.push(file);
                    }
                });

                // Optional: sort so that .obj, .mtl, and texture files appear in a stable order
                const extPriority = (name) => {
                    const lower = name.toLowerCase();
                    if (lower.endsWith('.obj')) return 3;
                    if (lower.endsWith('.mtl')) return 2;
                    if (lower.match(/\.(png|jpg|jpeg)$/)) return 1;
                    return 99;
                };
                meshFiles.sort((a, b) => extPriority(a.name) - extPriority(b.name));

                for (const file of meshFiles) {
                    const blob = await file.async('blob');
                    const url = URL.createObjectURL(blob);
                    console.debug("INFO", `Extracted Mesh file from ZIP: ${file.name} → ${url}`);
                    meshObj_paths.push(url);
                }

                console.debug("INFO", `Loading Mesh Files`);
                setFilePath_Mesh(meshObj_paths);
                obj_path.current = abstr_file_path;
            } catch (err) {
                console.debug("ERRO", 'Failed to process Mesh ZIP payload', err);
            }
            })();
    }

    /**************************************************************************************************************
     * Handler for loading and displaying Gaussian Splatting files.
     **************************************************************************************************************/
    function handleGaussianSplatting(value, abstr_file_path) {
        console.debug("INFO", 'Handling Gaussian Splatting File');
        mode.current = "GaussianSplatting"
        const receivedBlob = new Blob(value);
        const gaussiansplat_path = URL.createObjectURL(receivedBlob);
        setFilePath_GaussianSplat(gaussiansplat_path)
        obj_path.current = abstr_file_path
    }

    /**************************************************************************************************************
     * Handler for loading and displaying volumetric video files.
     **************************************************************************************************************/
    function handleVolumetricVideo(value, abstr_file_path) {
        console.debug("INFO", 'Handling Volumetric Video File');
        mode.current = "VolumetricVideo";

        (async () => {
            try {
                let voluObj_paths = []
    
                // New behavior: value represents a single ZIP file (possibly as array of chunks)
                const zipBlob = Array.isArray(value) ? new Blob(value) : new Blob([value]);

                const zip = await JSZip.loadAsync(zipBlob);

                // Collect all non-directory files
                const voluFiles = [];
                zip.forEach((relPath, file) => {
                    if (!file.dir) {
                        voluFiles.push(file);
                    }
                });

                // Type priority: json → png → mtl → obj
                const extPriority = (name) => {
                    const lower = name.toLowerCase();
                    if (lower.endsWith('.json')) return 1;
                    if (lower.endsWith('.png'))  return 2;
                    if (lower.endsWith('.mtl'))  return 3;
                    if (lower.endsWith('.obj'))  return 4;
                    return 99;
                };

                // FIrst by type priority, then alphabetically within each type
                voluFiles.sort((a, b) => {
                    const pa = extPriority(a.name);
                    const pb = extPriority(b.name);
                    if (pa !== pb) return pa - pb;
                    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                });

                for (const file of voluFiles) {
                    const blob = await file.async('blob');
                    const url = URL.createObjectURL(blob);
                    console.debug("INFO", 'Extracted Volumetric Video file from ZIP: ' + file.name + ' -> ' + url);
                    voluObj_paths.push(url);
                }

                console.debug("INFO", 'Loading File ' + voluObj_paths);
                setFilePath_Mesh(voluObj_paths)
                obj_path.current = abstr_file_path
            } catch (err) {
                console.debug("ERRO", 'Failed to process Volumetric Video ZIP payload', err);
            }
        })();      
    }

    /**************************************************************************************************************
     * Handler for loading and displaying light field files.
     **************************************************************************************************************/
    function handleLightField(value, abstr_file_path) {
        console.debug("INFO", 'Handling LightField File');
        mode.current = "LightField";

        // contains paths to the mp4 and the json file
        (async () => {
            try {
                let lightFieldObj_paths = []
    
                // New behavior: value represents a single ZIP file (possibly as array of chunks)
                const zipBlob = Array.isArray(value) ? new Blob(value) : new Blob([value]);
   
                const zip = await JSZip.loadAsync(zipBlob);

                // Collect all non-directory files
                const lfFiles = [];
                zip.forEach((relPath, file) => {
                    if (!file.dir) {
                        lfFiles.push(file);
                    }
                });
                // Optional: sort so that .json and .mp4/.png files appear in a stable order
                const extPriority = (name) => {
                    const lower = name.toLowerCase();
                    if (lower.endsWith('.png')) return 2;
                    if (lower.endsWith('.mp4')) return 2;
                    if (lower.endsWith('.json')) return 1;
                    return 99;
                };
                lfFiles.sort((a, b) => extPriority(a.name) - extPriority(b.name));

                for (const file of lfFiles) {
                    const blob = await file.async('blob');
                    const url = URL.createObjectURL(blob);
                    lightFieldObj_paths.push(url);
                }
                console.debug("INFO", 'Extracted Lightfield files from ZIP.');

                console.debug("INFO", 'Loading File ', {lightFieldObj_paths});
                setFilePath_LightField(lightFieldObj_paths)
                obj_path.current = abstr_file_path
            } catch (err) {
                console.debug("ERRO", 'Failed to process LightField ZIP payload', err);
            }
        })();   
    }

    /**************************************************************************************************************
     * Callback function executed because Variable "responseFile" in WebRTCConnection has changed.
     * Update of the renderer with the new file.
     **************************************************************************************************************/
    function handleRenderFile(dataStruct) {
        console.debug("INFO", `Load ${dataStruct["abstractPath"].split("/").pop()} into ${dataStruct["rid"]} renderer.`)

        setFileName(dataStruct["abstractPath"].split("/").pop())
        
        let value = dataStruct["data"]
        let file_type = dataStruct["type"]
        let abstr_file_path = dataStruct["abstractPath"]
        let rid = dataStruct["rid"]
        let layer = dataStruct["mode"]

        setActiveDataType(file_type)

        // check for object type
        // Images have the extensions "png" and "jpg"
        // Pointclouds have the extensions "obj" and "ply"
        // Meshes have the extension "obj" and a corresponding png texture has to exist
        if(file_type === "Image") {
            handleImage(value, abstr_file_path, rid, layer)
        } else if(file_type === "Video") {
            handleVideo(value, abstr_file_path)
        } else if(file_type === "PointCloud") {
            handlePointCloud(value, abstr_file_path)
        } else if(file_type === "Mesh") {
            handleMesh(value, abstr_file_path) 
        } else if(file_type === "GaussianSplatting") {
            handleGaussianSplatting(value, abstr_file_path)
        } else if(file_type === "VolumetricVideo") {
            handleVolumetricVideo(value, abstr_file_path)
        } else if(file_type === "LightField") {
            handleLightField(value, abstr_file_path)
        }

        setActiveDownload(false)
    }

    /**************************************************************************************************************
     * Will be executed when user drops a file on the renderer or selects a file from the Items-Menu.
     * Sends a request to the compute node to get the file.
     **************************************************************************************************************/
    async function updateRenderer(file_path, file_name_with_ext) {
        setActiveDownload(true)
        const data_send = {
            "command": "/file",
            "data": {
                "rid": rid,
                "abstractPath": file_path + "/" + file_name_with_ext,
                "mode": "original"
            }
        }

        console.debug("SEND", "[Compute Node] Request File via command /file",  data_send)
        rtc.sendMessage(JSON.stringify(data_send))
    }

    /**************************************************************************************************************
     * Handler for toggling the color palette for the reference view.
     **************************************************************************************************************/
    async function handleColorPalette() {
        setColorPaletteEnabled(prev => !prev);
        localStorage.setItem("Renderer:colorPaletteEnabled", !colorPaletteEnabled);
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return(
        <div className='renderer'>
            <div className="renderer-title">              
                 <div 
                    className='renderer-close-button'
                    onClick={() => setActiveDataType(null)}
                    title="Close"
                >
                    <HighlightOffOutlinedIcon/>
                </div>
                {title}
            </div>

            {activeDownload ? (
                <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                    <CircularProgress />
                </div>
            ) : null}

            {/* {rid === "ref" && colorPaletteEnabled && ( */}
            {/* {rid === "ref" && (
                <>
                    <ColorLensOutlinedIcon className="renderer-color-palette-icon" onClick={() => handleColorPalette()} />
                    {colorPaletteEnabled && <ColorPalette />}
                </>
            )} */}

            {activeDataType === "Image" && (
                <ImageRenderer 
                    rid={rid} 
                    activeDataType={activeDataType}
                    filePath={filePath_Image}
                    fileName={fileName}
                    setObjInfo={setObjInfo}
                    setSettings={setSettings}
                    outputModifications={outputModifications}
                    semanticMaps={semanticMaps}
                />
            )}
            <VideoRenderer 
                activeDataType={activeDataType}
                filePath={filePath_Video}
                setObjInfo={setObjInfo}
            />
            {/*This renderer is used for the following views:
            (1) Point Clouds
            (2) Meshes
            (3) Volumetric Videos
            (4) 3D Color Histograms
            (5) 3D Color Distributions
            (6) Gaussian Splatting
            */}
            {["Mesh", "PointCloud", "VolumetricVideo"].includes(activeDataType) && (
                <MeshRenderer
                    rid={rid} 
                    activeDataType={activeDataType}
                    filePath={filePath_Mesh}
                    fileName={fileName}
                    obj_type={mode.current}
                    setObjInfo={setObjInfo}
                    setSettings={setSettings}
                    setMeshTexture={setMeshTexture}
                />
            )}

            <LightFieldRenderer 
                activeDataType={activeDataType}
                filePath={filePath_LightField}
                view={rid} 
                setObjInfo={setObjInfo}
                setSettings={setSettings}
            />

            <GaussianSplatRenderer 
                activeDataType={activeDataType}
                filePath={filePath_GaussianSplat}
                fileName={fileName}
                fileExtension={obj_path.current.split('.').pop()}
                view={rid} 
                setObjInfo={setObjInfo}
                setSettings={setSettings}
            /> 

            <RenderBar downloadProgress={downloadProgress} loadingProgress={loadingProgress}/> 
        </div>
    );
}