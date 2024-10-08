/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, { useState, useEffect, Suspense, useRef} from 'react';
import $ from 'jquery';
import PointCloud from "rendering/PointCloud"
import ColorDistribution from "rendering/ColorDistribution"
import ColorDistribution2 from "rendering/ColorDistribution2"
import VoxelGrid from "rendering/VoxelGrid"
import ColorHistogram from "rendering/ColorHistogram"
import TriangleMesh from "rendering/TriangleMesh"
import Terminal, { consolePrint } from 'pages/Console/Terminal';
import {active_server} from 'pages/SideBarLeft/Server'
import {updateHistogram} from 'pages/Console/ColorHistogram'
import {pathjoin, request_file_existence} from 'utils/Utils';
import {execution_params_objects} from 'pages/Console/Console'

import ImageRenderer from 'pages/Body/ImageRenderer'
import VideoRenderer from 'pages/Body/VideoRenderer'
import MeshRenderer from 'pages/Body/MeshRenderer'
import LightFieldRenderer from 'pages/Body/LightFieldRenderer'
import RenderBar from './RenderBar';
import LoadingView from './LoadingView';
import GaussianSplatRenderer from './GaussianSplatRenderer';
import PointCloudVoxelGrid from 'rendering/PointCloud';

import * as THREE from 'three';

import './Renderer.scss';
import { useRouteError } from 'react-router-dom';


let canv = null;
export const active_reference = "Single Input"

// Description of the <data_config> object
// rendering -> contains the current render object
export const data_config = {}
for(let renderer_obj of ["Source", "Reference", "Output"]) {
    data_config[renderer_obj] = {
        "filename": null,
        "rendering": [],
        "mesh": null,
        "3D_color_histogram": null,
        "3D_color_distribution": null,
        "voxel_grid": null,
        "pc_center": null,
        "pc_scale":null
    }
}

/* ------------------------------------------------------------------------------------------------------------
-- Shows either the 2D or 3D renderer
-------------------------------------------------------------------------------------------------------------*/
export const showView = (imageID, videoID, renderCanvasID, view_lightfieldID, view_emptyID, view) => {
    $("#" + view_emptyID).css("display", "none")
    if(view === "3D") {
        $("#" + imageID).css("visibility", "hidden")
        $("#" + videoID).css("visibility", "hidden")
        $("#" + renderCanvasID).css("display", "block")
        $("#" + view_lightfieldID).css("display", "none")
        // stop the video if it is still running
        try { $("#" + videoID).children("video").get(0).pause(); }
        catch (error) {}
    } else if(view === "video") {
        $("#" + imageID).css("visibility", "hidden")
        $("#" + videoID).css("visibility", "visible")
        $("#" + renderCanvasID).css("display", "none")
        $("#" + view_lightfieldID).css("display", "none")
    } else if(view === "lightfield") {
        $("#" + imageID).css("visibility", "hidden")
        $("#" + videoID).css("visibility", "hidden")
        $("#" + renderCanvasID).css("display", "none")
        $("#" + view_lightfieldID).css("display", "block")
    } else {
        $("#" + imageID).css("visibility", "visible")
        $("#" + videoID).css("visibility", "hidden")
        $("#" + renderCanvasID).css("display", "none")
        $("#" + view_lightfieldID).css("display", "none")
        // stop the video if it is still running
        try {
            $("#" + videoID).children("video").get(0).pause();
        }
        catch (error) {
        }
    }
}

/* ----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Renderer windows for (1) Source, (2) Reference, (3) Output and (4) Comparison
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
const Renderer = (props) =>  {
    /* ------------------------------------------------------------------------------------------------------------
    -- IMPORTANT:
    -- This identifier can be either "src", "ref" or "out" and will be concatenated with ids of other
    -- components to create a unique identifier for each renderer.
    -------------------------------------------------------------------------------------------------------------*/
    const RID = props.window
    /* ------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [enableUpdate, changeEnableupdate] = useState(0)
    const [fieldTexture, setFieldTexture] = useState(null);
    const [init, setInit] = useState(false)
    const [view, setView] = useState(null)

    // stores if the object is completely loaded
    const [complete, setComplete] = useState(false)

    /* ------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    // Describes which data type is displayed
    // Possible values: ["", "Image", "PointCloud", "Mesh"]
    const mode = useRef("")
    // stores object information like: width, height, etc. 
    const objInfo = useRef(null)
    const data = useRef("")
    // stores the current mesh or pointcloud
    const mesh = useRef([])
    // stores the mesh for the 3D color histogram
    const histogram3D = useRef(null)
    const colorDistribution3D = useRef(null)
    const object3D = useRef(null)
    const voxel3D = useRef(null)
    // stores pointcloud information for voxel rendering
    const ref_pc_center = useRef(null)
    const ref_pc_scale = useRef(null)

    const objArray = useRef([])

    // stores the current lightfield
    const lightfield = useRef([])

    const obj_path = useRef("xxx")
    const infoBoxEnabled = useRef(false)

    const ID = props.id;
    const window = props.window;
    // Only Source, Reference and Comparison are droppable
    const DROPPABLE = props.droppable;
    const TITLE = props.title



    const imageID = "renderer_image" + ID
    const videoID = "renderer_video" + ID
    const innerImageID = "renderer_image_inner" + ID
    const innerVideoID = "renderer_video_inner" + ID
    const renderCanvasID = "renderer_canvas" + ID
    const view_lightfieldID = "view_lightfield_" + ID
    const view_gaussianSplat_ID = "view_gaussiansplat_" + ID
    const infoboxID = "renderer_info" + ID
    const renderBarID = "renderer_bar" + ID
    const view_emptyID = "view_empty_" + ID
    const view_loadingID = "view_loading_" + ID
 
    const initPath = "data"

    // store an identifier for the MeshRenderer which object type is currently displayed
    // Values: (1) Mesh (2) PointCloud (3) VolumetricVideo
    let meshRendererMode = useRef("Mesh")

    let [filePath_LightField, setFilePath_LightField] = useState(null)
    let [filePath_GaussianSplat, setFilePath_GaussianSplat] = useState(null)
    let [filePath_Image, setFilePath_Image] = useState(null)
    let [filePath_Video, setFilePath_Video] = useState(null)
    let [filePath_Mesh, setFilePath_Mesh] = useState(null)

    /* ------------------------------------------------------------------------------------------------------------
    -- Remove the loading screen after the object is loaded.
    -------------------------------------------------------------------------------------------------------------*/
    useEffect(() => {
        let loadingRenderer = $("#" + view_loadingID)
        loadingRenderer.css("display", "none")
    }, [complete])

    /* ------------------------------------------------------------------------------------------------------------
    -- This method is called when the user drops a file from the Items-Menu on the renderer.
    -- Note:
    --   Content of data:
    --   E.g. data = /Meshes/GameBoy_medium:GameBoy_medium.obj
    --   I.e. <path_to_file>:<file>
    -------------------------------------------------------------------------------------------------------------*/
    function drop_method(event) {
        event.preventDefault();
        var data = event.dataTransfer.getData('text');
        var [file_path, file_name_with_ext] = data.split(":")
        var [file_name, file_ext] = file_name_with_ext.split(".")
        updateRenderer(file_path, file_name, file_name_with_ext, file_ext)
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- This method is called when the user selects the Source- or the Reference-Button on the Items-Menu.
    -- Note:
    --   Content of data:
    --   E.g. data = /Meshes/GameBoy_medium:GameBoy_medium.obj
    --   I.e. <path_to_file>:<file>
    -------------------------------------------------------------------------------------------------------------*/
    function click_method(data) {
        var [file_path, file_name_with_ext] = data.split(":")
        var [file_name, file_ext] = file_name_with_ext.split(".")
        console.log("DATA: ", data)
        updateRenderer(file_path, file_name, file_name_with_ext, file_ext)
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function updateRenderer(file_path, file_name, file_name_with_ext, file_ext) {
        console.log("INFO", "Loading object: " + file_path)
        console.log("INFO", "Loading object: " + file_name)
        console.log("INFO", "Loading object: " + file_name_with_ext)
        console.log("INFO", "Loading object: " + file_ext)

        // check for object type
        // Images have the extensions "png" and "jpg"
        // Pointclouds have the extensions "obj" and "ply"
        // Meshes have the extension "obj" and a corresponding png texture has to exist
        if(file_ext === "png" || file_ext === "jpg") {
            mode.current = "Image"
            // change the visibility of the image canvas only if the RGB color space button is not checked
            if(!$("#settings_rgbcolorspace").checked)
                switchView("Image")

            // show the dropped image
            var image_path = pathjoin(active_server, initPath, file_path, file_name_with_ext)
            setFilePath_Image(image_path)

            obj_path.current = pathjoin(file_path, file_name_with_ext)

        } else if(file_ext === "mp4") {
            mode.current = "Video"
            // change the visibility of the image canvas only if the RGB color space button is not checked
            if(!$("#settings_rgbcolorspace").checked)
                switchView("Video")

            var video_path = pathjoin(active_server, initPath, file_path, file_name_with_ext)
            setFilePath_Video(video_path)
 
            obj_path.current = pathjoin(file_path, file_name_with_ext)

        } else if(file_ext == "obj" || file_ext == "ply") {
            mode.current = "PointCloud"
            var filepath = pathjoin(active_server, initPath, file_path, file_name_with_ext)
            setFilePath_Mesh(filepath)
            obj_path.current = pathjoin(file_path, file_name_with_ext)
            switchView("Mesh")
        } else if(file_ext == "mesh") {
            console.log("INFO", "Loading mesh: " + file_path)
            mode.current = "Mesh"
            var filepath = pathjoin(active_server, initPath, file_path, file_name)
            setFilePath_Mesh(filepath)
            meshRendererMode.current = "Mesh"
            changeRendering(object3D.current)
            switchView("Mesh")
        } else if(file_ext == "gsp") {
            console.log("INFO", "Loading gaussian splatting: " + file_path)
            const gaussiansplat_path = pathjoin(active_server, initPath, file_path, file_name_with_ext)
            setFilePath_GaussianSplat(gaussiansplat_path)
            switchView("GaussianSplat")
        } else if(file_ext == "volu") {
            console.log("INFO", "Loading volumetric video: " + file_path)
            let volumetricvideo_path = pathjoin(active_server, initPath, file_path, file_name)
            mode.current = "VolumetricVideo"
            setFilePath_Mesh(volumetricvideo_path)

            obj_path.current = pathjoin(file_path, file_name_with_ext)
            //changeRendering2(objArray.current)
            switchView("Mesh")
        } else if(file_ext == "lf") {
            console.log("INFO", "Loading lightfield: " + file_path)
            mode.current = "LightField"
            let lightfield_path = pathjoin(active_server, initPath, file_path, file_name + ".mp4");
            setFilePath_LightField(lightfield_path)
            switchView("LightField")
        }

        //server_post_request(active_server, "color_distribution", pathjoin(initPath, file_path, file_name_with_ext), updateColorDistribution, window)
        //server_post_request(active_server, "color_histogram", pathjoin(initPath, file_path, file_name_with_ext), updateHistogram, window)
        //server_post_request(active_server, "object_info", pathjoin(initPath, file_path, file_name_with_ext), updateObjectInfo, null)
 
        // if the infobox is visible, disable and rerender it if a new object is loaded
        if(infoBoxEnabled.current) {
            infoBoxEnabled.current = false
            showObjectInfo()
        }

        // set the execution parameters
        execution_params_objects[window] = obj_path.current
    }
    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const switchView = (view) => {
        let loadingRenderer = $("#" + view_loadingID)
        let emptyRenderer = $("#" + view_emptyID)
        let imageRenderer = $("#" + imageID)
        let videoRenderer = $("#" + videoID)
        let lightFieldRenderer = $("#" + view_lightfieldID)
        let meshRenderer = $("#" + renderCanvasID)
        let gaussianSplatRenderer = $("#" + view_gaussianSplat_ID)

        loadingRenderer.css("display", "block")
        emptyRenderer.css("display", "none")
        imageRenderer.css("visibility", "hidden")
        videoRenderer.css("visibility", "hidden")
        lightFieldRenderer.css("display", "none")
        meshRenderer.css("display", "none")
        gaussianSplatRenderer.css("display", "none")

        // stop the video if it is still running
        try {  videoRenderer.children("video").get(0).pause(); }
        catch (error) {}

        if(view == "Image") {imageRenderer.css("visibility", "visible")}
        else if(view == "Video") {videoRenderer.css("visibility", "visible")}
        else if(view == "LightField") {lightFieldRenderer.css("display", "block")}
        else if(view == "Mesh") {meshRenderer.css("display", "block")}
        else if(view == "GaussianSplat") {gaussianSplatRenderer.css("display", "block")}
    }
    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const updateColorDistribution = (data, parameters) => {
        var dist_vals = data["data"]["distribution"]
        let scaled_dist_vals = (dist_vals.flat()).map(function(x) { return x / 255.0; })
        colorDistribution3D.current = <ColorDistribution2 key={Math.random()} file_path={pathjoin(active_server, initPath, "PointClouds/template.ply")} dist_vals={scaled_dist_vals} id={TITLE}/>
    }
    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const updateObjectInfo = (data, parameters) => {
        objInfo.current = data

        // set 3D color histogram
        var eval_values = data["data"]["histogram"]
        var eval_values = {}
        histogram3D.current = <ColorHistogram key={Math.random()} histogram={eval_values} />

        // set 3D voxel grid
        var voxelgrid_centers = data["data"]["voxelgrid_centers"]
        var voxelgrid_colors = data["data"]["voxelgrid_colors"]
        var voxelgrid_scale = data["data"]["scale"]
        voxel3D.current = <VoxelGrid key={Math.random()} 
                            voxelgrid_centers={voxelgrid_centers}  
                            voxelgrid_colors={voxelgrid_colors} 
                            voxelgrid_scale={voxelgrid_scale}
                            center={ref_pc_center}
                            scale={ref_pc_scale}/>
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function show3DColorDistribution(e){
        // if this method is called via the EventListener, <e> describes the event otherwise
        // <e> describes the checkbox
        if (typeof e.target !== 'undefined')
            var button_enabled = e.target.checked
        else
            var button_enabled = e.checked

        if(mode.current == "Image") {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_3dcolorhistogram", show3DColorHistogram)
                disableCheckbox("settings_voxelgrid", showVoxelGrid)
                showView(imageID, videoID, renderCanvasID, view_lightfieldID, view_emptyID, "3D")
                changeRendering(colorDistribution3D.current)
            } else {
                showView(imageID, videoID, renderCanvasID, view_lightfieldID, view_emptyID, "2D")
            }
        } else {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_3dcolorhistogram", show3DColorHistogram)
                disableCheckbox("settings_voxelgrid", showVoxelGrid)
                changeRendering(colorDistribution3D.current)
            } else {
                changeRendering(object3D.current)
            }
        }
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function show3DColorHistogram(e){
        // if this method is called via the EventListener, <e> describes the event otherwise
        // <e> describes the checkbox
        if (typeof e.target !== 'undefined')
            var button_enabled = e.target.checked
        else
            var button_enabled = e.checked

        if(mode.current == "Image") {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_rgbcolorspace", show3DColorDistribution)
                disableCheckbox("settings_voxelgrid", showVoxelGrid)
                showView(imageID, videoID, renderCanvasID, view_lightfieldID, view_emptyID, "3D")
                changeRendering(histogram3D.current)
            } else {
                showView(imageID, videoID, renderCanvasID, view_lightfieldID, view_emptyID, "2D")
            }
        }

        if(mode.current == "PointCloud" || mode.current == "Mesh") {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_rgbcolorspace", show3DColorDistribution)
                disableCheckbox("settings_voxelgrid", showVoxelGrid)
                changeRendering(histogram3D.current)
            }               
            else
                changeRendering(object3D.current)
        }
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function showVoxelGrid(e){
        // if this method is called via the EventListener, <e> describes the event otherwise
        // <e> describes the checkbox
        if (typeof e.target !== 'undefined')
            var button_enabled = e.target.checked
        else
            var button_enabled = e.checked

        if(mode.current == "PointCloud") {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_rgbcolorspace", show3DColorHistogram)
                disableCheckbox("settings_3dcolorhistogram", showVoxelGrid)
                changeRendering(voxel3D.current)
            }
            else
                changeRendering(object3D.current)
        }
    }

    /* ------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- HELPER METHODS
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/

    /* ------------------------------------------------------------------------------------------------------------
    -- Enables a given output type. Supported types are:
    -- (1) mesh
    -- (2) voxel_grid
    -- (3) 3D_color_distribution
    -- (4) 3D_color_histogram
    -------------------------------------------------------------------------------------------------------------*/
    // TODO: Reduce to one method
    function changeRendering(obj) {
        //mesh.current.pop()
        mesh.current.length = 0;
        mesh.current.push(obj)
        changeEnableupdate(Math.random())
        console.log(mesh.current[0])
    }

    function changeRendering2(objs) {
        //mesh.current.pop()
        mesh.current.length = 0;
        objs.forEach((obj) => {
            mesh.current.push(obj);
        });
        //mesh.current.push(obj)
        changeEnableupdate(Math.random())
        //console.log(mesh.current[0])
    }


    /* ------------------------------------------------------------------------------------------------------------
    -- Disables the checkbox with the given ID
    -------------------------------------------------------------------------------------------------------------*/
    function disableCheckbox(id, method) {
        let checkbox = $("#" + id)
        if(checkbox.prop("checked")) method(checkbox)
        checkbox.prop("checked", false);
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- Registration of EventListener
    -------------------------------------------------------------------------------------------------------------*/
    function observer_updateOutputRenderer(mutations) {
        let out_renderer = $("#renderer_image_innerrenderer_out")
        let pat = out_renderer.attr("data-src")
        console.log("HEHEH: " + pat)
        let file_name_with_ext = pat.split("/").pop()
        let [file_name, file_ext] = file_name_with_ext.split(".")
        var file_path = "Output"

        // check if the string in data-src contains the identifier $mesh$
        if(pat.includes("$mesh$"))
            file_path = "Output/$mesh$" + file_name
        // check if the string in data-src contains the identifier $volumetric$
        if(pat.includes("$volumetric$"))
            file_path = "Output/$volumetric$" + file_name

        updateRenderer(file_path, file_name, file_name_with_ext, file_ext)

    }
    /* ------------------------------------------------------------------------------------------------------------
    -- Registration of EventListener
    -------------------------------------------------------------------------------------------------------------*/
    useEffect(() => {
        if(DROPPABLE) {
            $("#" + ID).on("dragover", function(e) {e.preventDefault();})
            $("#" + ID).on("drop", (e) => {drop_method(e.originalEvent)})
            $("#" + ID).on("itemClicked", function(e, data){click_method(data)});
        } else {
            let out_renderer_id = "renderer_image_inner" + "renderer_out"
            let out_renderer = document.getElementById(out_renderer_id)
            var observer = new MutationObserver(observer_updateOutputRenderer);
            let options = {
            attributes: true,
            attributeFilter: ["data-update"]
            };
            observer.observe(out_renderer, options);
        }

        $("#settings_rgbcolorspace").on("change", show3DColorDistribution)
        $("#settings_3dcolorhistogram").on("change", show3DColorHistogram)
        $("#settings_voxelgrid").on("change", showVoxelGrid)
    }, []);


    /* ------------------------------------------------------------------------------------------------------------
    -- ...
    -------------------------------------------------------------------------------------------------------------*/
    function showObjectInfo() {
        let curinfo = objInfo.current["data"]
        let infos;
        if(mode.current == "Image")
            infos = {
                "height": curinfo["height"],
                "width": curinfo["width"],
                "channels": curinfo["channels"],
            }
        else if(mode.current == "PointCloud")
            infos = {
                "num_vertices": curinfo["num_vertices"],
                "vertexcolors": curinfo["vertexcolors"],
                "vertexnormals": curinfo["vertexnormals"],
            }
        else if(mode.current == "Mesh")
            infos = {
                "num_vertices": curinfo["num_vertices"],
                "num_faces": curinfo["num_faces"],
                "trianglenormals": curinfo["trianglenormals"],
                "vertexcolors": curinfo["vertexcolors"],
                "vertexnormals": curinfo["vertexnormals"],
            }

        // check if object was selected and the object information is requested
        if(objInfo.current == null) {
            consolePrint("WARNING", "No object is selected...");
            return;
        }

        if (objInfo.current["enabled"]) {
            if(infoBoxEnabled.current) 
                $("#" + infoboxID).css("opacity", 0.0)
            else 
                $("#" + infoboxID).css("opacity", 0.75)
            infoBoxEnabled.current = !infoBoxEnabled.current
            let output_text = ""
            for (let k in infos){
                output_text += "<b>"+k+"</b>" + ": " + infos[k] + "<br />"
            }

            $("#" + infoboxID).html(output_text)
        }
        else 
            consolePrint("WARNING", "No object is selected...")
    }


    return(
        <div id={ID} style={props.style} className='renderer_container'>
            <div className="renderer_title">{TITLE}</div>
 {/*        <div className='renderer_info_button' onClick={showObjectInfo}>
                <img className="renderer_info_icon" src={icon_info_button}/>
            </div> */}
            <div id={infoboxID} className='renderer_info_box'>
                fasefs
            </div>

            <div id={view_emptyID} className='emptyRenderer'>
                {ID === 'renderer_out' ? 'No output has been calculated yet.' : 'Select a file from the database or drag and drop it here.'}
            </div>

            <ImageRenderer 
                id={imageID} 
                filePath={filePath_Image}
                setComplete={setComplete}
                innerid={innerImageID}
            />
            <VideoRenderer 
                id={videoID} 
                filePath={filePath_Video}
                setComplete={setComplete}
                innerid={innerVideoID}/>
            {/* 
            This renderer is used for the following views:
            (1) Point Clouds
            (2) Meshes
            (3) Volumetric Videos
            (4) 3D Color Histograms
            (5) 3D Color Distributions
            (6) Gaussian Splatting
            */}
            <MeshRenderer 
                id={renderCanvasID} 
                filePath={filePath_Mesh}
                setComplete={setComplete}
                renderBarID={renderBarID}
                view={TITLE} 
                //rendering={mesh.current} 
                //obj_path={obj_path.current} 
                obj_type={mode.current}
            />
            <LightFieldRenderer 
                id={view_lightfieldID} 
                filePath={filePath_LightField}
                renderBarID={renderBarID}
                setComplete={setComplete}
            />

            <GaussianSplatRenderer 
                id={view_gaussianSplat_ID} 
                filePath={filePath_GaussianSplat}
                renderBarID={renderBarID}
                setComplete={setComplete}
            />

            {/* <LoadingView id={view_loadingID}/> */}
            <RenderBar id={renderBarID}/>

        </div>
    );
}

export default Renderer;