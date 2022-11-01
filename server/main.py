# Note: Tensorflow has to be imported before everything else otherwise a CUBLAS error appears
import tensorflow as tf
tf.compat.v1.disable_eager_execution()
#config = tf.compat.v1.ConfigProto()
#config.gpu_options.allow_growth = True
#session = tf.compat.v1.Session(config=config)

from http.server import BaseHTTPRequestHandler, HTTPServer, SimpleHTTPRequestHandler
import os
import json
import re
import cv2
import time
import numpy as np
from numba import cuda
import shutil
import timeout_decorator

from module.MeshProcessing.PLYLoader import PLYLoader
from module.ImageProcessing.Image import Image
from module.ColorTransfer import ColorTransfer



#init_path = "../../VSCodeProjects/color-transfer-tool/public/data"
init_path = "data"
PORT = 8001
ADDRESS = "localhost"
#ADDRESS = "192.168.178.45"


# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
#
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
class MyServer(SimpleHTTPRequestHandler):
    # ------------------------------------------------------------------------------------------------------------------
    # method description
    # ------------------------------------------------------------------------------------------------------------------
    def do_GET(self):
        print("Receive...")
        if self.path == "/server_status" or self.path == "/available_methods" or self.path == "/database":
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            #self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
        else:
            pass
            #self.send_response(200)
            #self.send_header("Content-type", "image/jpeg")
            #self.send_header('Access-Control-Allow-Origin', '*')
            #self.end_headers()

        response = {
            "service": None,
            "enabled": "false",
            "data": None
        }
        if self.path == "/server_status":
            response["service"] = "server_status"
            response["enabled"] = "true"
            response["data"] = self.address_string()
            print(response)

        elif self.path == "/available_methods":
            response["service"] = "available_methods"
            response["enabled"] = "true"
            response["data"] = ColorTransfer.get_available_methods()
            print(response)

        elif self.path == "/database":
            out = []
            show_database_content(init_path, out)

            response["service"] = "database"
            response["enabled"] = "true"
            response["data"] = out
            print(response)

        #elif self.path.split(":")[0] == "/file":
        else:
            #out = []
            #response["service"] = "file"
            #response["enabled"] = "true"
            #response["data"] = out
            #response = self.path.split(":")[1]
            #print(response)
            #self.send_response(200)

            return SimpleHTTPRequestHandler.do_GET(self)
            #shutil.move("output/out.ply", "../../VSCode/color-transfer-tool/public/output")


        self.wfile.write(bytes(str(response), "utf-8"))

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)

    # ------------------------------------------------------------------------------------------------------------------
    # method description
    # ------------------------------------------------------------------------------------------------------------------
    def do_OPTIONS(self):
        print("Was zur HÖLLE")
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')

    # ------------------------------------------------------------------------------------------------------------------
    # method description
    # ------------------------------------------------------------------------------------------------------------------
    #@timeout_decorator.timeout(5, use_signals=False)
    def do_POST(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.send_header("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS")
        #self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        #self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        response = {
            "service": None,
            "enabled": "false",
            "data": {
                "histogram": [],
                "mean": [],
                "std": [],
                "extension": ""
            }
        }

        if self.path == "/color_transfer":
            datalen = int(self.headers['Content-Length'])
            data = self.rfile.read(datalen)
            obj = json.loads(data)
            print(obj)
            folder_src, file_src = obj["source"].split(":")
            folder_ref, file_ref = obj["reference"].split(":")
            _, extension_src = file_src.split(".")
            _, extension_ref = file_ref.split(".")
            approach = obj["approach"]
            print(obj["options"])

            src_path = init_path + "/" + folder_src + "/" + file_src
            ref_path = init_path + "/" + folder_ref + "/" + file_ref
            # check the source and reference types
            if extension_src == "ply":
                loader_src = PLYLoader(src_path)
                src = loader_src.get_mesh()
            elif extension_src == "png" or extension_src == "jpg":
                src = Image(file_path=src_path)

            if extension_ref == "ply":
                loader_ref = PLYLoader(ref_path)
                ref = loader_ref.get_mesh()
            elif extension_ref == "png" or extension_ref == "jpg":
                ref = Image(file_path=ref_path)

            ct = ColorTransfer(src, ref, obj["options"])
            output = ct.apply(approach)

            if extension_src == "ply":
                out_loader = PLYLoader(mesh=output)
                out_loader.write(init_path + "/Output/" + obj["output"] + ".ply")
                response["data"]["extension"] = "ply"
            elif extension_src == "png" or extension_src == "jpg":
                output.write(init_path + "/Output/" + obj["output"] + ".jpg")
                response["data"]["extension"] = "jpg"

            response["service"] = "color_transfer"
            response["enabled"] = "true"
            response["data"]["histogram"] = output.get_color_statistic()[0].tolist()
            response["data"]["mean"] = output.get_color_statistic()[1].tolist()
            response["data"]["std"] = output.get_color_statistic()[2].tolist()


            #output.write("output/out.ply")
            # shutil leads the clients webpage to reload
            #shutil.move("output/out.ply", "../../VSCode/color-transfer-tool/public/output")

            #print(obj)
        elif self.path == "/color_histogram":
            datalen = int(self.headers['Content-Length'])
            data = self.rfile.read(datalen)
            obj = json.loads(data)
            folder, file = obj.split(":")
            _, extension = file.split(".")

            print(obj)

            path = init_path + "/" + folder + "/" + file

            if extension == "ply":
                loader_src = PLYLoader(path)
                src = loader_src.get_mesh()
            elif (extension == "png" or extension == "jpg"):
                src = Image(file_path=path)

            response["service"] = "color_histogram"
            response["enabled"] = "true"
            response["data"] = {
                "histogram": src.get_color_statistic()[0].tolist(),
                "mean": src.get_color_statistic()[1].tolist(),
                "std": src.get_color_statistic()[2].tolist()
            }
        elif self.path == "/upload":
            print("UPLOAD")
            """Handle a POST request."""
            # Save files received in the POST
            wasSuccess, files_uploaded = self.handle_file_uploads()
            print(wasSuccess)

            # Compose a response to the client
            response_obj = {
                "wasSuccess": wasSuccess,
                "files_uploaded": files_uploaded,
                "client_address": self.client_address
            }

            response_str = json.dumps(response_obj)

            self.log_message(response_str)

            # Send our response code, header, and data
            self.send_response(200)
            self.send_header("Content-type", "Application/json")
            self.send_header("Content-Length", len(response_str))
            self.end_headers()
            self.wfile.write(response_str.encode('utf-8'))
            #datalen = int(self.headers['Content-Length'])
            #data = self.rfile.read(datalen)
            #obj = json.loads(data)
            ##img = cv2.imdecode(buf=np.frombuffer(data, np.uint8), flags=cv2.IMREAD_UNCHANGED)
            ##cv2.imshow("test", img)
            ##cv2.waitKey(0)
            #print(data)
            print("JELLO")

        #print(response)
        print("Done")
        self.wfile.write(bytes(str(response), "utf-8"))

    def read_line(self):
        line_str = self.rfile.readline().decode('ISO-8859-1')
        self.char_remaining -= len(line_str)
        return line_str

    def handle_file_uploads(self):
        """
        Take the post request and save any files received to the same folder
        as this script.
        Returns
            wasSuccess: bool: whether the process was a success
            files_uploaded: list of string: files that were created
        """
        self.char_remaining = int(self.headers['content-length'])
        # Find the boundary from content-type, which might look like:
        # 'multipart/form-data; boundary=----WebKitFormBoundaryUI1LY7c2BiEKGfFk'
        boundary = self.headers['content-type'].split("=")[1]

        basepath = self.translate_path(self.path)
        # Strip this script's name from the path so it's just a folder
        basepath = os.path.dirname(basepath)

        # ----WebKitFormBoundaryUI1LY7c2BiEKGfFk
        line_str = self.read_line()
        if not boundary in line_str:
            print("Content did NOT begin with boundary as it should")
            return False, []

        files_uploaded = []
        print("FUCKC")
        while self.char_remaining > 0:
            # Breaking out of this loop on anything except a boundary
            # an end-of-file will be a failure, so let's assume that
            wasSuccess = False

            # Content-Disposition: form-data; name="file"; filename="README.md"
            line_str = self.read_line()
            filename = re.findall('Content-Disposition.*name="file"; ' +
                                  'filename="(.*)"', line_str)
            if not filename:
                self.log_message("Can't find filename " + filename)
                break
            else:
                filename = filename[0]
            filepath = os.path.join(basepath, "data/Uploads/" + filename)
            try:
                outfile = open(filepath, 'wb')
            except IOError:
                self.log_message("Can't create file " + str(filepath) +
                                 " to write; do you have permission to write?")
                break

            # Content-Type: application/octet-stream
            line_str = self.read_line()

            # Blank line
            line_str = self.read_line()

            # First real line of code
            preline = self.read_line()
            # Loop through the POST until we find another boundary line,
            # signifying the end of this file and the possible start of another
            while self.char_remaining > 0:
                line_str = self.read_line()

                # ----WebKitFormBoundaryUI1LY7c2BiEKGfFk
                if boundary in line_str:
                    preline = preline[0:-1]
                    if preline.endswith('\r'):
                        preline = preline[0:-1]
                    outfile.write(preline.encode('ISO-8859-1'))
                    outfile.close()
                    self.log_message("File '%s' upload success!" % filename)
                    files_uploaded.append(filename)
                    # If this was the last file, the session was a success!
                    wasSuccess = True
                    break
                else:
                    outfile.write(preline.encode('ISO-8859-1'))
                    preline = line_str

        return wasSuccess, files_uploaded

# ------------------------------------------------------------------------------------------------------------------
# method description
# ------------------------------------------------------------------------------------------------------------------
def show_directory_content(path, out):
    directory_contents = os.listdir(path)

    for item in directory_contents:
        sub_path = path + "/" + item
        if os.path.isdir(sub_path):
            if len(os.listdir(sub_path)) == 0:
                out[item] = "empty"
            else:
                out[item] = {}
                show_directory_content(sub_path, out[item])
        else:
            out[item] = "file:" + sub_path


# ------------------------------------------------------------------------------------------------------------------
# method description
# ------------------------------------------------------------------------------------------------------------------
def show_database_content2(path, out):
    directory_contents = os.listdir(path)

    for item in directory_contents:

        folder = {"name": item, "folders": [], "files": []}
        sub_path = path + "/" + item

        for ob in os.listdir(sub_path):
            folder["files"].append(ob)

        out.append(folder)


# ------------------------------------------------------------------------------------------------------------------
# method description
# ------------------------------------------------------------------------------------------------------------------
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
    #print(json.dumps(out, indent=4))


# ------------------------------------------------------------------------------------------------------------------
# method description
# ------------------------------------------------------------------------------------------------------------------
def run(server_class=HTTPServer, handler_class=BaseHTTPRequestHandler):
    server_address = (ADDRESS, PORT)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()



# ------------------------------------------------------------------------------------------------------------------
# method description
# ------------------------------------------------------------------------------------------------------------------
def main():
    print("Running...")
    run(handler_class=MyServer)


if __name__ == '__main__':
    main()
