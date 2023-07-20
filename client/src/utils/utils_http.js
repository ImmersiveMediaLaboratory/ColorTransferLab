/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import SysConf from "settings/SystemConfiguration";
import Images from "constants/Images";
import Console from "pages/Console/Console";

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- CONSTRUCTOR
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Requests {
    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- Public Methods
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/

    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- Private Methods
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/


    /*-------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    static server_request = (path, address) => {
        try {
            const xmlHttp = new XMLHttpRequest();
            const theUrl = address + path
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
            var out = {
                "service": path,
                "enabled": false,
                "data": null
            }
            return(out)
        }
    }

}

export default Requests