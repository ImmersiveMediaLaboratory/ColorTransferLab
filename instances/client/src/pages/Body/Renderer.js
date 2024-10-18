/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, { useState, useEffect, useRef} from 'react';
import $ from 'jquery';
import {active_server} from 'Utils/System'
import {pathjoin, consolePrint} from 'Utils/Utils';
import {execution_data} from 'Utils/System'
import ImageRenderer from 'pages/Body/ImageRenderer'
import VideoRenderer from 'pages/Body/VideoRenderer'
import MeshRenderer from 'pages/Body/MeshRenderer'
import LightFieldRenderer from 'pages/Body/LightFieldRenderer'
import RenderBar from './RenderBar';
import LoadingView from './LoadingView';
import GaussianSplatRenderer from './GaussianSplatRenderer';
import RendererButton from 'pages/Body/RendererButton';
import './Renderer.scss';


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
/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** Renderer windows for (1) Source, (2) Reference and (3) Output
 ******************************************************************************************************************
 ******************************************************************************************************************/
const Renderer = (props) =>  {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
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
    // stores if the object is completely loaded
    const [complete, setComplete] = useState(false)

    let [filePath_LightField, setFilePath_LightField] = useState(null)
    let [filePath_GaussianSplat, setFilePath_GaussianSplat] = useState(null)
    let [filePath_Image, setFilePath_Image] = useState(null)
    let [filePath_Video, setFilePath_Video] = useState(null)
    let [filePath_Mesh, setFilePath_Mesh] = useState(null)
    /* ------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    // Describes which data type is displayed
    // Possible values: ["", "Image", "PointCloud", "Mesh"]
    const mode = useRef("")
    // stores object information like: width, height, etc. 
    const objInfo = useRef(null)
    // stores the current mesh or pointcloud
    const mesh = useRef([])
    // stores the mesh for the 3D color histogram
    const histogram3D = useRef(null)
    const colorDistribution3D = useRef(null)
    const object3D = useRef(null)

    const obj_path = useRef("xxx")
    const infoBoxEnabled = useRef(false)

    /* ------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const ID = props.id;
    const window = props.window;
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
    const view_loadingID = "view_loading_" + ID
    const view_emptyID = "view_empty_" + RID
 
    const initPath = "data"


    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Remove the loading screen after the object is loaded.
     **************************************************************************************************************/
    useEffect(() => {
        let loadingRenderer = $("#" + view_loadingID)
        loadingRenderer.css("display", "none")
    }, [complete])

    /**************************************************************************************************************
     * Registration of EventListener
     **************************************************************************************************************/
    useEffect(() => {
        if(props.droppable) {
            $("#" + ID).on("dragover", function(e) {e.preventDefault();})
            $("#" + ID).on("drop", (e) => {drop_method(e.originalEvent)})
            $("#" + ID).on("itemClicked", function(e, data){click_method(data)});
        } else {
            let out_renderer_id = "renderer_image_innerrenderer_out"
            let out_renderer = document.getElementById(out_renderer_id)
            let observer = new MutationObserver(observer_updateOutputRenderer);
            let options = {
                attributes: true,
                attributeFilter: ["data-update"]
            };
            observer.observe(out_renderer, options);
        }
    }, []);


    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * This method is called when the user drops a file from the Items-Menu on the renderer.
     * Note:
     * Content of data:
     * E.g. data = /Meshes/GameBoy_medium:GameBoy_medium.obj
     * I.e. <path_to_file>:<file>
     **************************************************************************************************************/
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
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    function click_method(data) {
        var [file_path, file_name_with_ext] = data.split(":")
        var [file_name, file_ext] = file_name_with_ext.split(".")
        console.log("DATA: ", data)
        updateRenderer(file_path, file_name, file_name_with_ext, file_ext)
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
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

        } else if(file_ext === "obj" || file_ext === "ply") {
            mode.current = "PointCloud"
            var filepath = pathjoin(active_server, initPath, file_path, file_name_with_ext)
            setFilePath_Mesh(filepath)
            obj_path.current = pathjoin(file_path, file_name_with_ext)
            switchView("Mesh")
        } else if(file_ext === "mesh") {
            console.log("INFO", "Loading mesh: " + file_path)
            mode.current = "Mesh"
            var filepath = pathjoin(active_server, initPath, file_path, file_name)
            setFilePath_Mesh(filepath)
            //meshRendererMode.current = "Mesh"
            changeRendering(object3D.current)
            switchView("Mesh")
        } else if(file_ext === "gsp") {
            console.log("INFO", "Loading gaussian splatting: " + file_path)
            const gaussiansplat_path = pathjoin(active_server, initPath, file_path, file_name_with_ext)
            setFilePath_GaussianSplat(gaussiansplat_path)
            switchView("GaussianSplat")
        } else if(file_ext === "volu") {
            console.log("INFO", "Loading volumetric video: " + file_path)
            let volumetricvideo_path = pathjoin(active_server, initPath, file_path, file_name)
            mode.current = "VolumetricVideo"
            setFilePath_Mesh(volumetricvideo_path)

            obj_path.current = pathjoin(file_path, file_name_with_ext)
            switchView("Mesh")
        } else if(file_ext === "lf") {
            console.log("INFO", "Loading lightfield: " + file_path)
            mode.current = "LightField"
            let lightfield_path = pathjoin(active_server, initPath, file_path, file_name + ".mp4");
            setFilePath_LightField(lightfield_path)
            switchView("LightField")
        }
 
        // if the infobox is visible, disable and rerender it if a new object is loaded
        if(infoBoxEnabled.current) {
            infoBoxEnabled.current = false
            showObjectInfo()
        }

        // set the execution parameters
        if(window === "src")
            execution_data["source"] = obj_path.current
        else if(window === "ref")
            execution_data["reference"] = obj_path.current
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
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

        if(view === "Image") {imageRenderer.css("visibility", "visible")}
        else if(view === "Video") {videoRenderer.css("visibility", "visible")}
        else if(view === "LightField") {lightFieldRenderer.css("display", "block")}
        else if(view === "Mesh") {meshRenderer.css("display", "block")}
        else if(view === "GaussianSplat") {gaussianSplatRenderer.css("display", "block")}
        
        //filePath_Mesh = null
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    function show3DColorDistribution(e){
        // if this method is called via the EventListener, <e> describes the event otherwise
        // <e> describes the checkbox
        let button_enabled;
        if (typeof e.target !== 'undefined')
            button_enabled = e.target.checked
        else
            button_enabled = e.checked

        if(mode.current === "Image") {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_3dcolorhistogram", show3DColorHistogram)
                showView(imageID, videoID, renderCanvasID, view_lightfieldID, view_emptyID, "3D")
                changeRendering(colorDistribution3D.current)
            } else {
                showView(imageID, videoID, renderCanvasID, view_lightfieldID, view_emptyID, "2D")
            }
        } else {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_3dcolorhistogram", show3DColorHistogram)
                changeRendering(colorDistribution3D.current)
            } else {
                changeRendering(object3D.current)
            }
        }
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    function show3DColorHistogram(e){
        // if this method is called via the EventListener, <e> describes the event otherwise
        // <e> describes the checkbox
        let button_enabled;
        if (typeof e.target !== 'undefined') button_enabled = e.target.checked
        else button_enabled = e.checked

        if(mode.current === "Image") {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_rgbcolorspace", show3DColorDistribution)
                showView(imageID, videoID, renderCanvasID, view_lightfieldID, view_emptyID, "3D")
                changeRendering(histogram3D.current)
            } else {
                showView(imageID, videoID, renderCanvasID, view_lightfieldID, view_emptyID, "2D")
            }
        }

        if(mode.current === "PointCloud" || mode.current === "Mesh") {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_rgbcolorspace", show3DColorDistribution)
                changeRendering(histogram3D.current)
            }               
            else
                changeRendering(object3D.current)
        }
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- Enables a given output type. Supported types are:
    -- (1) mesh
    -- (2) voxel_grid
    -- (3) 3D_color_distribution
    -- (4) 3D_color_histogram
    -------------------------------------------------------------------------------------------------------------*/
    // TODO: Reduce to one method
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    function changeRendering(obj) {
        //mesh.current.pop()
        mesh.current.length = 0;
        mesh.current.push(obj)
        changeEnableupdate(Math.random())
        console.log(mesh.current[0])
    }

    /**************************************************************************************************************
     * Disables the checkbox with the given ID
     **************************************************************************************************************/
    function disableCheckbox(id, method) {
        let checkbox = $("#" + id)
        if(checkbox.prop("checked")) method(checkbox)
        checkbox.prop("checked", false);
    }

    /**************************************************************************************************************
     * Registration of EventListener
     **************************************************************************************************************/
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

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    function showObjectInfo() {
        let curinfo = objInfo.current["data"]
        let infos;
        if(mode.current === "Image")
            infos = {
                "height": curinfo["height"],
                "width": curinfo["width"],
                "channels": curinfo["channels"],
            }
        else if(mode.current === "PointCloud")
            infos = {
                "num_vertices": curinfo["num_vertices"],
                "vertexcolors": curinfo["vertexcolors"],
                "vertexnormals": curinfo["vertexnormals"],
            }
        else if(mode.current === "Mesh")
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
                output_text += "<b>"+k+"</b>: " + infos[k] + "<br />"
            }

            $("#" + infoboxID).html(output_text)
        }
        else 
            consolePrint("WARNING", "No object is selected...")
    }


    /**************************************************************************************************************
     * Allows the upload of local images and point clouds.
     * The items can be accessed via the <Uploads> button within the <DATABASE> window.
     * DISABLED: The upload function is disabled in the current version.
     **************************************************************************************************************/
    function chooseFile() {
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = _this => {
                let files =   Array.from(input.files);

                try {
                    const xmlHttp = new XMLHttpRequest();
                    const theUrl = pathjoin(active_server, "upload");
                    xmlHttp.open( "POST", theUrl, false );
                    
                    let formData = new FormData()
                    formData.append("file", files[0]);

                    // console.log(formData)

                    xmlHttp.send(formData);
                    consolePrint("INFO", "File uploaded")

                    // update databse content
                    //request_database_content(active_server)
                    //request_database_content()
                }
                catch (e) {
                    console.log(e)
                }
            };
        input.click();
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const switchDefault = () => {
        $("#" + view_emptyID).css("display", "flex")
        $("#" + imageID).css("visibility", "hidden")
        $("#" + videoID).css("visibility", "hidden")
        $("#" + renderCanvasID).css("display", "none")
        $("#" + view_lightfieldID).css("display", "none")
        $("#" + view_gaussianSplat_ID).css("display", "none")
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return(
        <div id={ID} style={props.style} className='renderer_container'>
            <div className="renderer_title">
                {ID !== 'renderer_out' ? <RendererButton onClick={switchDefault} src={"assets/icons/icon_x.png"}/> : null}
                {TITLE}
            </div>

            <div id={infoboxID} className='renderer_info_box'>
                fasefs
            </div>

            <div id={view_emptyID} className='emptyRenderer'>
                <div className="emptyRendererInner">
                    {ID === 'renderer_out' ? 'No output has been calculated yet.' : '(1) Select a file from the database (2) drag and drop it here or (3) upload it.'}
                    {ID !== 'renderer_out' ?
                        <div className='uploadButton' onClick={chooseFile}>
                            Upload
                        </div>
                    : null}
                </div>
            </div>

            <ImageRenderer 
                id={imageID} 
                filePath={filePath_Image}
                setComplete={setComplete}
                view={RID} 
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
                view={RID} 
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
                view={RID} 
                setComplete={setComplete}
            /> 

            <LoadingView id={view_loadingID}/>
            <RenderBar id={renderBarID}/>

        </div>
    );
}

export default Renderer;