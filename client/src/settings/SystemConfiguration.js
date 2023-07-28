/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class SystemConfiguration {
    // these parameters will be sent to the python server
    // static execution_params = {
    //     "source": "",
    //     "reference": "",
    //     // "approach": "",
    //     "output": "",
    //     "comparison": "",
    //     // "options": []
    // }

    // // reference to the state change method which triggers the rerendering of the color histograms
    // static colorHistogramStateChange = {
    //     "Source": null,
    //     "Reference": null,
    //     "Output": null
    // };

    /* 
    Description of the <data_config> object
    rendering -> contains the current render object
    */
    // static data_config = {
    //     "Source": {
    //         "filename": null,
    //         "rendering": [],
    //         "mesh": null,
    //         "3D_color_histogram": null,
    //         "3D_color_distribution": null,
    //         "voxel_grid": null,
    //         "pc_center": null,
    //         "pc_scale":null
    //     },
    //     "Reference": {
    //         "filename": null,
    //         "rendering": [],
    //         "mesh": null,
    //         "3D_color_histogram": null,
    //         "3D_color_distribution": null,
    //         "voxel_grid": null,
    //         "pc_center": null,
    //         "pc_scale":null
    //     },
    //     "Output": {
    //         "filename": null,
    //         "rendering": [],
    //         "mesh": null,
    //         "3D_color_histogram": null,
    //         "3D_color_distribution": null,
    //         "voxel_grid": null,
    //         "pc_center": null,
    //         "pc_scale":null
    //     }
    // }
}

export default SystemConfiguration