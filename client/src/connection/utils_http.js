/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import SystemConfiguration from "settings/SystemConfiguration";
import Images from "constants/Images";
import Items from "pages/SideBarRight/Items";
import PointCloud from "rendering/PointCloud"
import SceneProperties from "settings/SceneProperties"
import Console from "pages/Console/Console";


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
export const server_request = (path) => {

    try {
        const xmlHttp = new XMLHttpRequest();
        const theUrl = "http://localhost:8001/" + path
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
        xmlHttp.send( null );
        // javascript receives json string from python with single quotes which have to be transferred to double quotes
        var stat = xmlHttp.responseText.replaceAll("\'", "\"");
        var stat = stat.replaceAll("True", "true");
        var stat = stat.replaceAll("False", "false");
        var stat = stat.replaceAll("None", "null");
        var stat_obj = JSON.parse(stat);
        stat_obj["enabled"] = (stat_obj["enabled"] === "true")
        return(stat_obj);
    }
    catch (e) {
        console.log(e)
        var out = {
            "service": path,
            "enabled": false,
            "data": null
        }
        return(out)
    }

}


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- CONSTRUCTOR
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Requests {
    /*-------------------------------------------------------------------------------------------------------------
    -- Checks if the python server is running
    -------------------------------------------------------------------------------------------------------------*/
    static request_server_status() {
        var stat_obj = server_request("server_status")

        if (stat_obj["enabled"]) 
            Console.consolePrint("INFO", "Server is running at " + stat_obj["data"])
        else
            Console.consolePrint("WARNING", "No server instance is running")
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- Request available color transfer methods and create buttons to apply these algorithms
    -------------------------------------------------------------------------------------------------------------*/
    static request_available_methods() {
        var stat_obj = server_request("available_methods")
        console.log(stat_obj)
        if (stat_obj["enabled"]) {
            Console.consolePrint("INFO", "Color transfer methods were found: "  + stat_obj["data"].length + " in total")

            function apply_color_transfer(param) {
                
                SystemConfiguration.execution_params["approach"] = param["name"]
                SystemConfiguration.execution_params["options"] = param["options"]
                Console.consolePrint("INFO", "Set Color Transfer Algorithm to: " + param["name"] )

                // set abstract in information tab of console
                var console_info = document.getElementById("Console_tab_console_test5")
                console_info.innerHTML = "<b>Title</b>:<br>" + param["title"] + "<br><br>" + 
                                         "<b>Year</b>:<br>" + param["year"] + "<br><br>" + 
                                         "<b>Abstract</b>:<br>" + param["abstract"]

                // set options in configuration tab of console
                var console_config = document.getElementById("Console_tab_console_test3")
                console_config.innerHTML = ""

                const tbl = document.createElement("table");
                const tblBody = document.createElement("tbody");
                const headerVal = ["Parameter", "Value", "Type", "Choices"]
                const optionsVal = ["name", "default", "type", "values"]

                // create table header
                const row = document.createElement("tr");
                for(let j = 0; j < 4; j++) {
                    const cell = document.createElement("th");
                    const cellText = document.createTextNode(headerVal[j])
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                }
                tblBody.appendChild(row)


                // creating all cells
                for (let i = 0; i < param["options"].length; i++) {
                    // if flag "changeable" is set to false the parameter shouldn't be listed
                    if(!param["options"][i]["changeable"])
                        continue;
                    // creates a table row
                    
                    const row = document.createElement("tr");

                    for (let j = 0; j < 4; j++) {

                        // Create a <td> element and a text node, make the text
                        // node the contents of the <td>, and put the <td> at
                        // the end of the table row
                        const cell = document.createElement("td");

                        function set_option(event, num, type) {
                            if(type == "int" || type == "float")
                                SystemConfiguration.execution_params["options"][num]["default"] = Number(event.currentTarget.value)
                            else if(type == "bool")
                                SystemConfiguration.execution_params["options"][num]["default"] = (event.currentTarget.value === "true")
                            else
                                SystemConfiguration.execution_params["options"][num]["default"] = event.currentTarget.value

                        }

                        if (optionsVal[j] == "default") {
                            // create select node if a finit number of options are available for a parameter
                            if( param["options"][i]["values"].length > 0 ) {
                                const cell = document.createElement("select");
                                cell.addEventListener("change", event => {set_option(event, i, param["options"][i]["type"])})
                                cell.style.width = "100%";
                                cell.style.backgroundColor = "#2B2C34";
                                cell.style.color = "white";
    
                                for(let x = 0; x < param["options"][i]["values"].length; x++){
                                    let va = param["options"][i]["values"][x]
                                    const cellVal = document.createElement("option");
                                    cellVal.setAttribute("value", va);
                                    if(va == param["options"][i]["default"]) {
                                        cellVal.selected = true
                                    }
                                    cellVal.innerHTML = va
                                    cell.appendChild(cellVal);
                                }
    
                                row.appendChild(cell);
                            }
                            else if( param["options"][i]["type"] == "int" ) {
                                let va = param["options"][i]["default"]
                                const cell = document.createElement("input");
                                cell.addEventListener("change", event => {set_option(event, i, param["options"][i]["type"])})
                                cell.setAttribute("value", va);
                                cell.style.width = "100%";
                                cell.style.backgroundColor = "#2B2C34";
                                cell.style.color = "white";
                                cell.type = "number"
                                cell.min = "-99999"
                                cell.max = "99999"
                                row.appendChild(cell);
                            }
                            else if( param["options"][i]["type"] == "float" ) {
                                let va = param["options"][i]["default"]
                                const cell = document.createElement("input");
                                cell.addEventListener("change", event => {set_option(event, i, param["options"][i]["type"])})
                                cell.setAttribute("value", va);
                                cell.style.width = "100%";
                                cell.style.backgroundColor = "#2B2C34";
                                cell.style.color = "white";
                                cell.type = "number"
                                cell.step = "0.1"
                                cell.min = "0"
                                cell.max = "99999"
                                row.appendChild(cell);
                            }
                            else {
                                const cell = document.createElement("div");
                                cell.innerHTML = "Placeholder"
                                row.appendChild(cell);
                            }


                        } 
                        else if (optionsVal[j] == "name") {
                            const cellText = document.createTextNode(param["options"][i][optionsVal[j]]);
                            cell.appendChild(cellText);
                            cell.title = param["options"][i]["tooltip"]
                            row.appendChild(cell);
                        }
                        else {
                            const cellText = document.createTextNode(param["options"][i][optionsVal[j]]);
                            cell.appendChild(cellText);
                            row.appendChild(cell);
                        }
     
                    }

                    // add the row to the end of the table body
                    tblBody.appendChild(row);
                }

                // put the <tbody> in the <table>
                tbl.appendChild(tblBody);
                // sets the border attribute of tbl to '2'
                tbl.setAttribute("tableLayout", "auto");
                tbl.setAttribute("width", "100%");
                //tbl.setAttribute("border", "2");

                console_config.append(tbl)

            }
  
            for (let elem of stat_obj["data"]){

                var sidebarleft_content_colorTransfer = document.getElementById("sidebarleft_content_colorTransfer")

                var colorTransfer_button = document.createElement("div");
                colorTransfer_button.className = "sidebarleft_approach"
                colorTransfer_button.innerHTML = elem["name"]
                colorTransfer_button.addEventListener("click", function(){apply_color_transfer(elem)});

                sidebarleft_content_colorTransfer.append(colorTransfer_button)
            }
        }
        else {
            Console.consolePrint("WARNING", "No color transfer methods were found")
        }
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- [ {"name": "images",
    --    "folders": [
    --      {
    --        "name": "examples",
    --        "folders": [],
    --        "files": ["exp1.ply", "exp2.ply"]}
    --      }    
    -- ]
    --    "files": ["file1.png", "file2.png"]}
    --    {"name": "pointclouds",
    --     "folders": []
    --     "files": ["file1.ply", "file2.ply"]} 
    -- ]
    -------------------------------------------------------------------------------------------------------------*/
    static request_database_content() {
        var database_obj = server_request("database")
        if (database_obj["enabled"]) {
            Console.consolePrint("INFO", "Database loaded")


            function show_files(fold, file_path) {
                var items_body = document.getElementById("items_body")
                items_body.innerHTML = ""
                for (const element of fold["files"]) {
                    var items_elem = document.createElement("div");
                    items_elem.title = element
                    
                    items_elem.draggable="true"
                    items_elem.addEventListener('dragstart', function(event) {
                        event.dataTransfer.setData('text', file_path + ":" + element);
                    }); 

                    items_elem.className = "items_elem";
                    //items_elem.addEventListener("click", function(){show_folder_content(folder)});
                    var items_elem_icon = document.createElement("img");
                    items_elem_icon.className = "items_elem_icon"
                    var file_extension = element.split(".")[1]
                    // get file extension to choose correct image in "ITEMS"
                    if (file_extension == "ply" || file_extension == "obj") {
                        items_elem_icon.src = Images.icon_items_elem
                    } 
                    else if(file_extension == "png" || file_extension == "jpg") {
                        items_elem_icon.src = Images.icon_items_elem2
                    }
                    var items_elem_text = document.createElement("div");
                    items_elem_text.innerHTML = element
                    items_elem_text.className = "items_elem_text"
                    items_elem.appendChild(items_elem_icon)
                    items_elem.appendChild(items_elem_text)
                    items_body.appendChild(items_elem)
                }
            }


            function show_subfolders(fold, cc) {
                var items_body = document.getElementById("items_body")
                items_body.innerHTML = ""
                if(fold[0].style.display == "none")
                    fold[0].style.display = 'block';
                else {
                    fold[0].style.display = 'none';
                    // hides all subfolders
                    for(const el of fold[1])
                        el.style.display = 'none';
                }
            }

            //function hide_subfolders

            function create_folder_button(folder, count, folder_path) {
                var database_elem = document.createElement("div");


                var colNum = 50 + count * 50
                database_elem.style.backgroundColor = "RGB(" + 50 + "," + colNum + "," + colNum + ")"
                database_elem.addEventListener("mouseover", function() {
                    database_elem.style.backgroundColor = "#1C6C90";
                });                    
                database_elem.addEventListener("mouseout", function() {
                    database_elem.style.backgroundColor = "RGB(" + 50 + "," + colNum + "," + colNum + ")";
                });


                database_elem.className = "database_elem";
                var database_elem_icon = document.createElement("img");
                database_elem_icon.className = "database_elem_icon"
                database_elem_icon.src = Images.icon_database_elem
                database_elem.title = folder["name"]


                const database_elem_text = document.createElement("div");
                database_elem_text.innerHTML = folder["name"]
                database_elem_text.className = "database_elem_text"
                database_elem.appendChild(database_elem_icon)
                database_elem.appendChild(database_elem_text)
                database_body.appendChild(database_elem)

                // all folders with count > 0 are subfolders and should be hidden
                if(count != 0)
                   database_elem.style.display = 'none';

                var arr_subs = []

                for (const subfolder of folder["folders"]){
                    const new_folder = create_folder_button(subfolder, count + 1, folder_path + "/" + folder["name"], database_elem)
                    arr_subs.push(new_folder[0])
                    database_elem.addEventListener("click", function() {show_subfolders(new_folder)});
                }

                if(folder["files"].length > 0) 
                    database_elem.addEventListener("click", function() {show_files(folder, folder_path + "/" + folder["name"])});

                return [database_elem, arr_subs]
            }


            SystemConfiguration.database_sets = database_obj["data"]
            const database_body = document.getElementById("database_body")
            database_body.innerHTML = ""
            const items_body = document.getElementById("items_body")
            items_body.innerHTML = ""

            console.log(database_obj["data"])
            for (const folder of database_obj["data"][0]["folders"]) {
                create_folder_button(folder, 0, "")
            }
        }
        else {
            Console.consolePrint("WARNING", "Could not find database")
        }
    }
}

export default Requests