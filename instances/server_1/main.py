"""
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
"""

# Note: Tensorflow has to be imported before everything else otherwise a CUBLAS error appears
#import tensorflow as tf
#tf.compat.v1.disable_eager_execution()
#config = tf.compat.v1.ConfigProto()
#config.gpu_options.allow_growth = True
#session = tf.compat.v1.Session(config=config)
from socketserver import ThreadingMixIn
from threading import Thread
import multiprocessing
from time import sleep

from http.server import BaseHTTPRequestHandler, HTTPServer, SimpleHTTPRequestHandler
import os
import json
import re
#import numpy as np
#from numba import cuda
#import func_timeout
import atexit
import requests

import ssl

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
        if self.path == "/ip_update":
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            return SimpleHTTPRequestHandler.do_GET(self)
        if self.path == "/available_servers":
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()

            with open("../../ressources/settings/database_server.json", 'r') as f:
                data = json.load(f)

            if len(data) == 0:
                response = {
                    "service": "available_servers",
                    "enabled": "false",
                    "data": data
                }
            else:
                response = {
                    "service": "available_servers",
                    "enabled": "true",
                    "data": data
                }
            self.wfile.write(bytes(str(response), "utf-8"))
        else:
            return SimpleHTTPRequestHandler.do_GET(self)

        

    # ------------------------------------------------------------------------------------------------------------------
    # method description
    # ------------------------------------------------------------------------------------------------------------------
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)

    # ------------------------------------------------------------------------------------------------------------------
    # method description
    # ------------------------------------------------------------------------------------------------------------------
    def do_OPTIONS(self):
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
        self.end_headers()

        if self.path == "/ip_update":
            obj = self.getJson()
            print(obj)
            write_address_to_db(obj["name"], obj["protocol"], obj["address"], obj["port"], obj["visibility"])

        response = {
            "service": None,
        }

        self.wfile.write(bytes(str(response), "utf-8"))

    # ------------------------------------------------------------------------------------------------------------------
    # method description
    # ------------------------------------------------------------------------------------------------------------------
    def getJson(self):
        datalen = int(self.headers['Content-Length'])
        data = self.rfile.read(datalen)
        obj = json.loads(data)
        return obj

    # ------------------------------------------------------------------------------------------------------------------
    # method description
    # ------------------------------------------------------------------------------------------------------------------
    def read_line(self):
        line_str = self.rfile.readline().decode('ISO-8859-1')
        self.char_remaining -= len(line_str)
        return line_str




class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle requests in a separate thread."""

# ------------------------------------------------------------------------------------------------------------------
# method description
# ------------------------------------------------------------------------------------------------------------------
def run(protocol, address, port, handler_class=BaseHTTPRequestHandler):
    server_address = (address, port)
    httpd = ThreadedHTTPServer(server_address, handler_class)
    if protocol == "https":
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_verify_locations('../../ressources/security/ca_bundle.crt')
        context.load_cert_chain(certfile='../../ressources/security/certificate.crt', keyfile='../../ressources/security/private.key')
        context.check_hostname = False
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    httpd.serve_forever()

# ------------------------------------------------------------------------------------------------------------------
# read settings file, i.e. proxy address and port
# ------------------------------------------------------------------------------------------------------------------
def read_settings(path):
    with open(path, 'r') as f:
        data = json.load(f)
        protocol = data["SI1"]["protocol"]
        lan = data["SI1"]["lan"]
        port = data["SI1"]["port"]
        return protocol, lan, port

# ------------------------------------------------------------------------------------------------------------------
# check if servers in database are still available
# ------------------------------------------------------------------------------------------------------------------
def check_servers():
    while(True):
        sleep(1)
        data_update = []
        with open("../../ressources/settings/database_server.json", 'r') as f:
            data = json.load(f)
            #print(data)
            for elem in data:
                print(elem)
                try:
                    url = elem["protocol"] + "://" + elem["address"] + ":" + str(elem["port"]) + "/check_availability"
                    x = requests.get(url, timeout=60, verify=False)

                    if x.status_code == 200:
                        data_update.append(elem)
                        # my_json = x.content.decode('utf8').replace("'", '"')
                        # data = json.loads(my_json)
                        # s = json.dumps(data, indent=4)
                        # print(s)
                except requests.exceptions.RequestException as e:
                    print("No Connection")
                    print(data_update)


        with open("../../ressources/settings/database_server.json", 'w') as f:
            json_object = json.dumps(data_update, indent=4)
            f.write(json_object)


# ------------------------------------------------------------------------------------------------------------------
# write incomming server addresses into database file
# ------------------------------------------------------------------------------------------------------------------
def write_address_to_db(name, protocol, address, port, visibility):
    with open("../../ressources/settings/database_server.json", 'r+') as f:
        data = json.load(f)

        dictionary = {
            "name": name,
            "protocol": protocol,
            "address": address,
            "port": port,
            "visibility": visibility
        }

        data.append(dictionary)

        json_object = json.dumps(data, indent=4)

        f.seek(0)
        f.write(json_object)

# ------------------------------------------------------------------------------------------------------------------
# write incomming server addresses into database file
# ------------------------------------------------------------------------------------------------------------------
def exit_handler():
    print("#################################################################")
    print("# Server Instance 1 is ending ...")
    print("#################################################################")
    with open("../../ressources/settings/database_server.json", 'w') as f:
        f.write("[]")

# ------------------------------------------------------------------------------------------------------------------
# method description
# ------------------------------------------------------------------------------------------------------------------
def main():

    Thread(target=check_servers).start()

    atexit.register(exit_handler)

    protocol, lan, port = read_settings("../../ressources/settings/settings.json")    
    print("#################################################################")
    print("# Server Instance 1 is running on " + protocol + "://" +  lan + ":" + str(port) + " ...")
    print("#################################################################")
    run(protocol, lan, port, handler_class=MyServer,)


if __name__ == '__main__':
    main()
