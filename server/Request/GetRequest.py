"""
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
"""

import os

from ColorTransferLib.ColorTransfer import ColorTransfer

class GetRequest():
    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    @staticmethod
    def server_status(server, response):
        response["service"] = "server_status"
        response["enabled"] = "true"
        response["data"] = server.address_string()
        return response

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    @staticmethod
    def available_methods(response):
        response["service"] = "available_methods"
        response["enabled"] = "true"
        response["data"] = ColorTransfer.get_available_methods()
        print(response["data"])
        return response

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    @staticmethod
    def available_metrics(response):
        response["service"] = "available_metrics"
        response["enabled"] = "true"
        response["data"] = ColorTransfer.get_available_metrics()
        return response

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    @staticmethod
    def database(init_path, response):
        out = []
        GetRequest.show_database_content(init_path, out)
        response["service"] = "database"
        response["enabled"] = "true"
        response["data"] = out
        return response

    # ------------------------------------------------------------------------------------------------------------------
    # method description
    # ------------------------------------------------------------------------------------------------------------------
    @staticmethod
    def show_database_content(path, out):
        def get_directory_content(p, arr, name):
            directory_contents = os.listdir(p)
            folder = {"name": name, "folders": [], "files": []}
            for item in directory_contents:
                sub_path = p + "/" + item
                if os.path.isfile(sub_path):
                    folder["files"].append(item)
                elif os.path.isdir(sub_path):
                    get_directory_content(sub_path, folder["folders"], item)
                else:
                    print("It is a special file (socket, FIFO, device file) or it doesn't exist.")
            arr.append(folder)

        get_directory_content(path, out, "root")