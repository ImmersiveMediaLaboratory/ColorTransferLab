"""
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
"""

from PyQt6.QtWidgets import QApplication, QMainWindow, QPushButton, QHBoxLayout, QVBoxLayout, QLineEdit, QWidget, QLabel, QFrame, QTextEdit, QSpacerItem, QSizePolicy, QProgressBar, QCheckBox, QComboBox
from PyQt6.QtGui import QColor, QPalette
from qasync import QEventLoop, asyncSlot
from datetime import datetime
import asyncio
import pkg_resources
from PyQt6.QtCore import QMetaObject, Qt, Q_ARG
import os
from utils.utils import Utils
import psycopg
import json

# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
#
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
class MainWindow(QMainWindow):
    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def __init__(self, main_server=None, signal_server=None, password=None):
        super().__init__()
        self.setWindowTitle("ColorTransferLab - ComputeNode - Version 1.0.0")
        self.setGeometry(100, 100, 500, 700)
        self.setFixedSize(500, 800)
        self.center()

        self.terminal = None
        self.signal_server_status = None
        self.compute_node_status = None

        self.connections_data = {}

        self.main_server = main_server
        self.signal_server = signal_server
        self.compute_node_name = "ComputeNode-" + Utils.generate_random_string()
        self.compute_node_privacy = False
        self.compute_node_privacy_pw = password

        # Main widget and layout
        main_widget = QWidget()
        main_layout = QVBoxLayout()

        # Init Information Block
        main_layout.addLayout(self.__init_information_block())
        spacer = QSpacerItem(20, 10, QSizePolicy.Policy.Minimum, QSizePolicy.Policy.Fixed)
        main_layout.addItem(spacer)
 
        # Init Signal Server Block
        main_layout.addLayout(self.__init_signalserver_block())
        spacer = QSpacerItem(20, 10, QSizePolicy.Policy.Minimum, QSizePolicy.Policy.Fixed)
        main_layout.addItem(spacer)    

        # Init Compute Node Block
        main_layout.addLayout(self.__init_computenode_block())
        spacer = QSpacerItem(20, 10, QSizePolicy.Policy.Minimum, QSizePolicy.Policy.Fixed)
        main_layout.addItem(spacer)    

        # Init Client Block
        main_layout.addLayout(self.__init_client_block())
        spacer = QSpacerItem(20, 40, QSizePolicy.Policy.Minimum, QSizePolicy.Policy.Fixed)
        main_layout.addItem(spacer)    

        # Init Terminal Block
        main_layout.addWidget(self.__init_terminal_block())
        button = QPushButton(f"Connect to Signal Server")
        button.clicked.connect(self.on_button_click)
        buttonDB = QPushButton(f"Init User Study Database")
        buttonDB.clicked.connect(self.on_button_click_db)
        button_layout = QHBoxLayout()
        button_layout.addWidget(button)
        button_layout.addWidget(buttonDB)
        main_layout.addLayout(button_layout)

        # Set main widget and layout
        main_widget.setLayout(main_layout)
        self.setCentralWidget(main_widget)

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def set_signal_server_status(self, status):
        self.signal_server_status.setText(status)
        if status == "Online" or status == "Connected":
            self.signal_server_status.setStyleSheet("color: green;")
        else:
            self.signal_server_status.setStyleSheet("color: red;")

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def set_compute_node_status(self, status):
        self.compute_node_status.setText(status)
        if status == "Idle":
            self.compute_node_status.setStyleSheet("color: yellow;")
        elif status == "Connected":
            self.compute_node_status.setStyleSheet("color: green;")
        else:
            self.compute_node_status.setStyleSheet("color: grey;")

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def set_compute_node_ip_address(self, status):
        self.compute_node_ip_address.setText(status)

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def set_compute_node_name(self, status):
        self.compute_node_name_val.setText(status)

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def set_client_ip_address(self, status):
        self.client_ip_address.setText(status)

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def set_client_id(self, status):
        self.client_id.setText(status)

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def set_client_name(self, status):
        self.client_name.setText(status)

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def set_client_status(self, status):
        self.client_status.setText(status)
        if status == "Idle":
            self.client_status.setStyleSheet("color: yellow;")
        elif status == "Connected":
            self.client_status.setStyleSheet("color: green;")
        else:
            self.client_status.setStyleSheet("color: white;")
    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def set_compute_node_id(self, id):
        self.compute_node_id.setText(id)

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def set_compute_node_password(self, password):
        self.compute_node_privacy_pw.setText(password)

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def center(self):
        screen = self.screen().geometry()
        size = self.geometry()
        self.move(
            (screen.width() - size.width()) // 2,
            (screen.height() - size.height()) // 2
        )

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def __init_information_block(self):
        box_layout = QVBoxLayout()
        label = QLabel(f"General Information:")
        font = label.font()
        font.setBold(True)
        label.setFont(font)
        label.setAlignment(Qt.AlignmentFlag.AlignLeft)
        box_layout.addWidget(label)

        separator = QFrame()
        separator.setFrameShape(QFrame.Shape.HLine)
        separator.setFrameShadow(QFrame.Shadow.Sunken)
        box_layout.addWidget(separator)

        hbox_layout = QHBoxLayout()
        label_databasepath = QLabel(f"Database Path:")
        label_databasepath.setFixedSize(190, 20)
        label_databasepath.setStyleSheet("color: grey;")
        hbox_layout.addWidget(label_databasepath)
        relative_path = "files/data"
        absolute_path = os.path.abspath(relative_path)
        max_len = 30
        display_path = absolute_path if len(absolute_path) <= max_len else absolute_path[:max_len-3] + "..."
        label2 = QLabel(display_path)
        label2.setToolTip(absolute_path)
        hbox_layout.addWidget(label2)
        box_layout.addLayout(hbox_layout)

        hbox_layout = QHBoxLayout()
        label_colortransferlibver = QLabel(f"ColorTransferLib Version:")
        label_colortransferlibver.setFixedSize(190, 20)
        label_colortransferlibver.setStyleSheet("color: grey;")
        hbox_layout.addWidget(label_colortransferlibver)
        colortransferlib_version = pkg_resources.get_distribution("ColorTransferLib").version
        label_colortransferlibver_val = QLabel(colortransferlib_version)
        hbox_layout.addWidget(label_colortransferlibver_val)
        box_layout.addLayout(hbox_layout)

        return box_layout
    
    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def __init_signalserver_block(self):
        box_layout = QVBoxLayout()
        label = QLabel(f"Signal Server Information:")
        font = label.font()
        font.setBold(True)
        label.setFont(font)
        label.setAlignment(Qt.AlignmentFlag.AlignLeft)
        box_layout.addWidget(label)

        separator = QFrame()
        separator.setFrameShape(QFrame.Shape.HLine)
        separator.setFrameShadow(QFrame.Shadow.Sunken)
        box_layout.addWidget(separator)

        hbox_layout = QHBoxLayout()
        label_signalserverurl = QLabel(f"URL:")
        label_signalserverurl.setFixedSize(190, 20)
        label_signalserverurl.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        label_signalserverurl.setStyleSheet("color: grey;")
        hbox_layout.addWidget(label_signalserverurl)

        self.lineedit_signalserverurl = QLineEdit()
        self.lineedit_signalserverurl.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.lineedit_signalserverurl.returnPressed.connect(self.update_signal_server_url)
        self.lineedit_signalserverurl.setPlaceholderText(self.signal_server)
        hbox_layout.addWidget(self.lineedit_signalserverurl)
        box_layout.addLayout(hbox_layout)

        hbox_layout = QHBoxLayout()
        label_signalserverstatus = QLabel(f"Status:")
        label_signalserverstatus.setFixedSize(190, 20)
        label_signalserverstatus.setStyleSheet("color: grey;")
        hbox_layout.addWidget(label_signalserverstatus)
        self.signal_server_status = QLabel(f"Offline")
        self.signal_server_status.setStyleSheet("color: red;")
        hbox_layout.addWidget(self.signal_server_status)
        box_layout.addLayout(hbox_layout)

        return box_layout

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def update_signal_server_url(self):
        new_url = self.lineedit_signalserverurl.text()

        if new_url:
            self.signal_server = new_url
            try:
                ss_reachable = Utils.is_address_reachable(new_url)
                if ss_reachable:
                    self.set_signal_server_status("Online")
                else:
                    self.set_signal_server_status("Offline")
                    Utils.printINFO(f"Signal server {new_url} is not available.", self)
            except Exception as e:
                self.set_signal_server_status("Offline")
                Utils.printINFO(f"Signal server {new_url} is not available.", self)

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def update_compute_node_name(self):
        new_name = self.compute_node_name_val.text()
        if new_name:
            self.compute_node_name = new_name

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def update_compute_node_privacy_pw(self):
        new_password = self.compute_node_privacy_pw_val.text()
        if new_password:
            self.compute_node_privacy_pw = new_password

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def __init_computenode_block(self):
        box_layout = QVBoxLayout()
        label = QLabel(f"Compute Node Information:")
        font = label.font()
        font.setBold(True)
        label.setFont(font)
        label.setAlignment(Qt.AlignmentFlag.AlignLeft)
        box_layout.addWidget(label)

        separator = QFrame()
        separator.setFrameShape(QFrame.Shape.HLine)
        separator.setFrameShadow(QFrame.Shadow.Sunken)
        box_layout.addWidget(separator)

        hbox_layout = QHBoxLayout()
        label_server_name = QLabel(f"Name:")
        label_server_name.setFixedSize(190, 20)
        label_server_name.setStyleSheet("color: grey;")
        hbox_layout.addWidget(label_server_name)

        self.compute_node_name_val = QLineEdit()
        self.compute_node_name_val.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.compute_node_name_val.returnPressed.connect(self.update_compute_node_name)
        self.compute_node_name_val.setPlaceholderText(self.compute_node_name)
        hbox_layout.addWidget(self.compute_node_name_val)
        box_layout.addLayout(hbox_layout)

        hbox_layout = QHBoxLayout()
        label_server_address = QLabel(f"IP Address:")
        label_server_address.setFixedSize(190, 20)
        label_server_address.setStyleSheet("color: grey;")
        hbox_layout.addWidget(label_server_address)
        self.compute_node_ip_address = QLabel(f"null")
        hbox_layout.addWidget(self.compute_node_ip_address)
        box_layout.addLayout(hbox_layout)

        hbox_layout = QHBoxLayout()
        label_id = QLabel(f"ID:")
        label_id.setFixedSize(190, 20)
        label_id.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        label_id.setStyleSheet("color: grey;")
        hbox_layout.addWidget(label_id)
        self.compute_node_id = QLabel(f"null")
        self.compute_node_id.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        hbox_layout.addWidget(self.compute_node_id)
        box_layout.addLayout(hbox_layout)

        hbox_layout = QHBoxLayout()
        label_server_status = QLabel(f"Status:")
        label_server_status.setFixedSize(190, 20)
        label_server_status.setStyleSheet("color: grey;")
        hbox_layout.addWidget(label_server_status)
        self.compute_node_status = QLabel(f"Disconnected")
        hbox_layout.addWidget(self.compute_node_status)
        box_layout.addLayout(hbox_layout)

        hbox_layout = QHBoxLayout()
        label_compute_node_privacy = QLabel(f"Private:")
        label_compute_node_privacy.setFixedSize(190, 20)
        label_compute_node_privacy.setStyleSheet("color: grey;")
        hbox_layout.addWidget(label_compute_node_privacy)
        self.label_compute_node_privacy_val = QCheckBox()
        self.label_compute_node_privacy_val.setChecked(self.compute_node_privacy)
        self.label_compute_node_privacy_val.stateChanged.connect(self.on_comptue_node_privacy_changed)
        hbox_layout.addWidget(self.label_compute_node_privacy_val)

        self.compute_node_privacy_pw_val = QLineEdit()
        self.compute_node_privacy_pw_val.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.compute_node_privacy_pw_val.returnPressed.connect(self.update_compute_node_privacy_pw)
        self.compute_node_privacy_pw_val.setPlaceholderText(self.compute_node_privacy_pw)
        hbox_layout.addWidget(self.compute_node_privacy_pw_val)

        box_layout.addLayout(hbox_layout)

        return box_layout
    
    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def on_comptue_node_privacy_changed(self, state):
        if state == 2:
            self.compute_node_privacy = True
        else:
            self.compute_node_privacy = False
    
    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def __init_terminal_block(self):
        frame = QFrame()
        frame.setFrameShape(QFrame.Shape.Box)
        frame.setLineWidth(1)
        box_layout = QVBoxLayout()

        label = QLabel(f"Terminal:")
        font = label.font()
        font.setBold(True)
        label.setFont(font)
        label.setAlignment(Qt.AlignmentFlag.AlignLeft)
        box_layout.addWidget(label)

        separator = QFrame()
        separator.setFrameShape(QFrame.Shape.HLine)
        separator.setFrameShadow(QFrame.Shadow.Sunken)
        box_layout.addWidget(separator)

        text_edit = QTextEdit()
        text_edit.setReadOnly(True)
        box_layout.addWidget(text_edit)
        self.terminal = text_edit

        self.progress_bar = QProgressBar()
        box_layout.addWidget(self.progress_bar)

        frame.setLayout(box_layout)
        return frame
    
    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def __init_client_block(self):
        box_layout = QVBoxLayout()
        label = QLabel(f"Client Information:")
        font = label.font()
        font.setBold(True)
        label.setFont(font)
        label.setAlignment(Qt.AlignmentFlag.AlignLeft)
        box_layout.addWidget(label)

        separator = QFrame()
        separator.setFrameShape(QFrame.Shape.HLine)
        separator.setFrameShadow(QFrame.Shadow.Sunken)
        box_layout.addWidget(separator)

        hbox_layout = QHBoxLayout()
        label_client_name = QLabel(f"Name:")
        label_client_name.setFixedSize(190, 20)
        label_client_name.setStyleSheet("color: grey;")
        hbox_layout.addWidget(label_client_name)
        self.client_name = QComboBox()
        self.client_name.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.client_name.currentIndexChanged.connect(self.update_client_info)
        hbox_layout.addWidget(self.client_name)
        box_layout.addLayout(hbox_layout)

        hbox_layout = QHBoxLayout()
        label_server_address = QLabel(f"IP Address:")
        label_server_address.setFixedSize(190, 20)
        label_server_address.setStyleSheet("color: grey;")
        hbox_layout.addWidget(label_server_address)
        self.client_ip_address = QLabel(f"null")
        hbox_layout.addWidget(self.client_ip_address)
        box_layout.addLayout(hbox_layout)

        hbox_layout = QHBoxLayout()
        label_server_status = QLabel(f"ID:")
        label_server_status.setFixedSize(190, 20)
        label_server_status.setStyleSheet("color: grey;")
        hbox_layout.addWidget(label_server_status)
        self.client_id = QLabel(f"null")
        hbox_layout.addWidget(self.client_id)
        box_layout.addLayout(hbox_layout)

        hbox_layout = QHBoxLayout()
        label_server_status = QLabel(f"Status:")
        label_server_status.setFixedSize(190, 20)
        label_server_status.setStyleSheet("color: grey;")
        hbox_layout.addWidget(label_server_status)
        self.client_status = QLabel(f"null")
        hbox_layout.addWidget(self.client_status)
        box_layout.addLayout(hbox_layout)

        return box_layout

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def set_client_box(self):
        self.client_name.clear()
        if isinstance(self.connections_data, dict):
            self.client_name.addItems([str(k) for k in self.connections_data.keys()])

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def update_client_info(self, index):
        comboValue = self.client_name.itemText(index)
        try:
            self.client_id.setText(self.connections_data[comboValue]["id"])
            self.client_ip_address.setText(self.connections_data[comboValue]["ip_address"])
            self.client_status.setText(self.connections_data[comboValue]["status"])
        except Exception as e:
            print(f"Error updating client info: {e}")

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def get_timestamp(self):
        now = datetime.now()
        return now.strftime("%H:%M:%S")

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def append_text_to_terminal(self, text_edit, text):
        text_edit.append("[" + self.get_timestamp() + "] " + text)

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def print_to_terminal(self, text, msg_type="info"):
        if msg_type == "info":
            col = "orange"
        elif msg_type == "recv":
            col = "lightblue"
        elif msg_type == "send":
            col = "lightgreen"
        else:
            col = "grey"

        self.terminal.setTextColor(QColor(col))
        self.append_text_to_terminal(self.terminal, text)
        self.terminal.setTextColor(QColor("grey"))

    def update_progress_bar(self, downloaded, total_length):
        progress = int(downloaded / total_length * 100)
        # QMetaObject.invokeMethod prevents the QPaintDevice and Segmentation fault error
        QMetaObject.invokeMethod(self.progress_bar, "setValue", Qt.ConnectionType.QueuedConnection, Q_ARG(int, progress))

        if progress >= 100:
            QMetaObject.invokeMethod(self.progress_bar, "hide", Qt.ConnectionType.QueuedConnection)

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    @asyncSlot()
    async def on_button_click(self):
        asyncio.ensure_future(self.main_server(self))

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    @asyncSlot()
    async def on_button_click_db(self):
        root_path = "files/study"

        conn = psycopg.connect(
            "dbname=userstudy user=postgres password=postgres host=localhost port=5432"
        )

        # Delete all existing entries in the item table
        with conn.cursor() as cur:
            cur.execute("TRUNCATE TABLE set, set_item, item CASCADE;")
            conn.commit()

        # Alle Ordner direkt unter root_path
        for folder_name in os.listdir(root_path):
            folder_path = os.path.join(root_path, folder_name)
            if os.path.isdir(folder_path):
                # Alle Unterordner in diesem Ordner
                for subfolder_name in os.listdir(folder_path):
                    subfolder_path = os.path.join(folder_path, subfolder_name)
                    if os.path.isdir(subfolder_path):
                        with open(os.path.join(root_path, folder_name, subfolder_name, "meta.json"), "r", encoding="utf-8") as f:
                            data = json.load(f)

                        with conn.cursor() as cur:
                            cur.execute("INSERT INTO item (test_name, dataset_name, meta) VALUES (%s, %s, %s);", (subfolder_name, folder_name, json.dumps(data)))
                            conn.commit()

        conn.close()

        Utils.printINFO(f"Database updated successfully.", self)

# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
#
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
class Interface():
    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    def __init__(self, main_server, signal_server, password):
        app = QApplication([])
        app.setStyle("Fusion")

        dark = QPalette()

        dark.setColor(QPalette.ColorRole.Window, QColor(53,53,53))
        dark.setColor(QPalette.ColorRole.WindowText, Qt.GlobalColor.white)
        dark.setColor(QPalette.ColorRole.Base, QColor(35,35,35))
        dark.setColor(QPalette.ColorRole.AlternateBase, QColor(53,53,53))
        dark.setColor(QPalette.ColorRole.ToolTipBase, Qt.GlobalColor.white)
        dark.setColor(QPalette.ColorRole.ToolTipText, Qt.GlobalColor.white)
        dark.setColor(QPalette.ColorRole.Text, Qt.GlobalColor.white)
        dark.setColor(QPalette.ColorRole.Button, QColor(53,53,53))
        dark.setColor(QPalette.ColorRole.ButtonText, Qt.GlobalColor.white)
        dark.setColor(QPalette.ColorRole.Highlight, QColor(42,130,218))
        dark.setColor(QPalette.ColorRole.HighlightedText, Qt.GlobalColor.black)

        app.setPalette(dark)

        app.setApplicationName("ColorTransferLab - ComputeNode")

        # qasync-Event-Loop starten
        loop = QEventLoop(app)
        asyncio.set_event_loop(loop)

        window = MainWindow(main_server, signal_server, password)
        window.show()

        # Download and extract database in background thread to prevent blocking of user interface
        asyncio.ensure_future(Utils.download_and_extract(window))

        ss_reachable = Utils.is_address_reachable(signal_server)
        if ss_reachable:
            window.set_signal_server_status("Online")
        else:
            window.set_signal_server_status("Offline")
            Utils.printINFO(f"Signal server {signal_server} is not available.", window)

        with loop:
            loop.run_forever()