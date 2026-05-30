/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './MeshRenderer.scss';
import {useEffect, useState, useRef} from 'react';
import {OrbitControls, PerspectiveCamera, OrthographicCamera} from "@react-three/drei";
import {Canvas} from "@react-three/fiber";
import Axes from "../elements/Axes"
import TriangleMesh from "../elements/TriangleMesh"
import PointCloud from "../elements/PointCloud"
import VolumetricVideo from '../elements/VolumetricVideo';
import SettingsFieldItem from '../../console/data/settings/SettingsFieldItem';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** MeshRenderer for rendering a mesh, point cloud or volumetric video.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function MeshRenderer({rid, activeDataType, filePath, fileName, obj_type, setObjInfo, setSettings, setMeshTexture}){   
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /* ------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [grid, changeGrid] = useState(<gridHelper args={[20,20, 0x222222, 0x222222]}/>)
    const [axis, changeAxis] = useState(<Axes />)
    const [camera, setCamera] = useState(null);
    const [perspectiveView, setPerspectiveView] = useState(true)
    const [fps, setFps] = useState(1);

    // ----------------------------
    // Point cloud states
    const [pointSize, setPointSize] = useState(1);
    const [showPointNormals, setShowPointNormals] = useState(false);

    // Volumetric video states
    const [frameCounter, setFrameCounter] = useState("0/0");

    // Mesh states
    const [showFaceNormals, setShowFaceNormals] = useState(false);
    const [showWireframe, setShowWireframe] = useState(false);

    /* ------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    // If the volumetric video ist stopped the fps has to be set to 60 in order use the forward and backward function
    // properly. The original fps value is saved in savedFps.
    const savedFps = useRef(1);
    const voluPlay = useRef(true);
    const voluForward = useRef(false);
    const voluBackward = useRef(false);


    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Changes the camera view from perspective to orthographic and vice versa.
     **************************************************************************************************************/
    useEffect(() => {
        if (perspectiveView) {
            setCamera(<PerspectiveCamera position={[4, 4, 4]} makeDefault />)
        } else {
            setCamera(<OrthographicCamera position={[10, 10, 10]} zoom={40} makeDefault />);
        }
    }, [perspectiveView]);

    /**************************************************************************************************************
     * Sets the settings for the mesh renderer in the settings panel of the console. The settings depend on the 
     * type of the object (mesh, point cloud or volumetric video).
     **************************************************************************************************************/
    useEffect(() => {
        if (setSettings && filePath !== null) {
            setSettings(prev => ({
                ...(prev || {}),
                [rid]: [
                    <SettingsFieldItem type={"checkbox"} defaultValue={true} onChange={handleGridChange}>Show Grid</SettingsFieldItem>,
                    <SettingsFieldItem type={"checkbox"} defaultValue={true} onChange={handleAxisChange}>Show Axes</SettingsFieldItem>,
                    <SettingsFieldItem type={"checkbox"} defaultValue={false} onChange={handleOrthographicViewChange}>Orthographic View</SettingsFieldItem>,
                    obj_type === "PointCloud" &&
                        <>
                            <SettingsFieldItem type={"checkbox"} defaultValue={false} onChange={handleVertexNormalViewChange}>Vertex Normal View</SettingsFieldItem>
                            <SettingsFieldItem type={"range"} min="1" max="10" defaultValue={1} onChange={handlePointSizeChange}>Point Size</SettingsFieldItem>
                        </>,
                    (obj_type === "VolumetricVideo" || obj_type === "Mesh") &&
                        <>
                            <SettingsFieldItem type={"checkbox"}  defaultValue={false} onChange={handleWireFrameChange}>WireFrame</SettingsFieldItem>
                            <SettingsFieldItem type={"checkbox"}  defaultValue={false} onChange={handleFaceNormal}>Face Normal</SettingsFieldItem>
                        </>,
                    obj_type === "VolumetricVideo" &&
                            <SettingsFieldItem type={"range"} min="1" max="10" defaultValue={fps} onChange={handleFpsChange}>FPS</SettingsFieldItem>
                ].filter(Boolean)
            }));
        }
    }, [filePath]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Changes the grid visibility.
     **************************************************************************************************************/
    const handleGridChange = (e) => {
        if (e.target.checked) {
            changeGrid(<gridHelper args={[20, 20, 0x222222, 0x222222]} />);
        } else {
            changeGrid(null);
        }
    };

    /**************************************************************************************************************
     * Changes the axis visibility.
     **************************************************************************************************************/
    const handleAxisChange = (e) => {
        if (e.target.checked) {
            changeAxis(<Axes />);
        } else {
            changeAxis(null);
        }
    };

    /**************************************************************************************************************
     * Changes the point size of point cloud and the color distributions.
     **************************************************************************************************************/
    const handlePointSizeChange = (e) => {
        setPointSize(e.target.value);
    }

    /**************************************************************************************************************
     * Switches between orthographic and perspective view.
     **************************************************************************************************************/
    const handleOrthographicViewChange = (e) => {
        setPerspectiveView(!e.target.checked)
    };

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const handleFpsChange = (event) => {
        setFps(event.target.value);
    };

    /**************************************************************************************************************
     * Renders the normals of the faces of the mesh or the normals of the vertices of the point cloud.
     **************************************************************************************************************/
    const handleVertexNormalViewChange = (e) => {
        setShowPointNormals(e.target.checked);
    }

    /**************************************************************************************************************
     * Show wireframe of the mesh.
     **************************************************************************************************************/
    const handleWireFrameChange = (e) => {
        setShowWireframe(e.target.checked);
    }
    
    /**************************************************************************************************************
     * Show face normals of the mesh.
     **************************************************************************************************************/
    const handleFaceNormal = (e) => {
        setShowFaceNormals(e.target.checked);
    }

    /**************************************************************************************************************
     * Downloads the currently rendered mesh / point cloud / volumetric video.
     **************************************************************************************************************/
    const download = (e) => {
        if (!filePath) return;
        let url = filePath;
        console.log("url:", url)
        let filename = fileName;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**************************************************************************************************************
     * Plays / Stops the volumetric video.
     **************************************************************************************************************/
    const playStopVolumetricVideo = () => {
        console.debug("INFO", "Play/Stop volumetric video")
        // If the volumetric video is currently not playing, set the fps to 60 to enable fast forward and backward functions, otherwise the speed would depend on the current fps. If it is playing, set the fps back to the original value.
        if(!voluPlay.current) {
            setFps(savedFps.current)
        } else {
            savedFps.current = fps;
            setFps(60)
        }
        voluPlay.current = !voluPlay.current;
        console.log(voluPlay.current)
    }

    /**************************************************************************************************************
     * Moves to the next frame of the volumetric video.
     **************************************************************************************************************/
    const forwardVolumetricVideo = () => {
        console.debug("INFO", "Load next frame of volumetric video.")
        voluForward.current = true;
    }

    /**************************************************************************************************************
     * Moves to the previous frame of the volumetric video.
     **************************************************************************************************************/
    const backwardVolumetricVideo = () => {
        console.debug("INFO", "Load previous frame of volumetric video.")
        voluBackward.current = true;
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div 
            className="meshrenderer"
            style={{ display: activeDataType === "Mesh" || activeDataType === "PointCloud" || activeDataType === "VolumetricVideo" ? "block" : "none" }}
        >    
            {/* Header of the renderer containing buttons for changing the output of the render view*/}
            <div className="meshrenderer-button-container">
                {(obj_type === "VolumetricVideo") && (
                    <>
                        <div
                            className="meshrenderer-button"
                            onClick={backwardVolumetricVideo}
                            title="Backward"
                        >
                            <ArrowBackIosNewIcon style={{ color: "#fff" }} />
                        </div>
                        <div
                            className="meshrenderer-button"
                            onClick={playStopVolumetricVideo}
                            title="Play/Pause"
                        >
                            <PlayArrowIcon style={{ color: "#fff" }} />
                        </div>
                        <div
                            className="meshrenderer-button"
                            onClick={forwardVolumetricVideo}
                            title="Forward"
                        >
                            <ArrowForwardIosIcon style={{ color: "#fff" }} />
                        </div>
                    </>
                )}
                <div
                    className="meshrenderer-button"
                    onClick={download}
                    title="Download"
                >
                    <FileDownloadOutlinedIcon style={{ color: "#fff" }} />
                </div>
            </div>

            {/* Framenumber counter */}
            {obj_type === "VolumetricVideo" && (
                <div className="meshrenderer-volucounter">Frame: {frameCounter}</div>
            )}

            {/* Canvas for rendering the mesh / pointcloud / volumetric video */}
            {/* unique key is necessary in order to remount the Canvas when the filePath changes */}
            <Canvas 
                key={rid + filePath}
                style={{"height": "calc(100% - 25px)", "backgroundColor": "#484848ff"}}>
                <ambientLight/>
                <OrbitControls/>
                {camera}
                {grid}
                {axis}
                {obj_type === "PointCloud" && filePath !== null && (
                    <PointCloud
                        rid={rid}
                        fileBlobURL={filePath} 
                        setObjInfo={setObjInfo}
                        pointSize={pointSize}
                        showPointNormals={showPointNormals}
                    />
                )}

                {obj_type === "Mesh" && filePath !== null && (
                    <TriangleMesh 
                        rid={rid}
                        fileBlobURL={filePath} 
                        setObjInfo={setObjInfo}
                        setMeshTexture={setMeshTexture}
                        showFaceNormals={showFaceNormals}
                        showWireframe={showWireframe}
                    />
                )}

                {obj_type === "VolumetricVideo" && filePath !== null && (
                    <VolumetricVideo
                        rid={rid}
                        fps={fps}
                        filepath={filePath} 
                        setObjInfo={setObjInfo}
                        setMeshTexture={setMeshTexture}
                        showFaceNormals={showFaceNormals}
                        showWireframe={showWireframe}
                        setFrameCounter={setFrameCounter}
                        playing={voluPlay}
                        forward={voluForward}
                        backward={voluBackward}
                    />
                )}
            </Canvas>
        </div>
    )
};