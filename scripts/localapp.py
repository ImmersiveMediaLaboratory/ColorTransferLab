# Copyright (C) 2022 The Qt Company Ltd.
# SPDX-License-Identifier: LicenseRef-Qt-Commercial OR BSD-3-Clause

# sudo apt-get install libxcb-cursor0
# sudo apt install mesa-utils
# sudo apt-get install --reinstall libgl1-mesa-glx libgl1-mesa-dri

"""PySide6 WebEngineWidgets Example"""

import sys
import os
from PySide6.QtCore import QUrl, Slot
from PySide6.QtGui import QIcon
from PySide6.QtWidgets import (QApplication, QLineEdit, QMainWindow, QPushButton, QToolBar)
from PySide6.QtWebEngineCore import QWebEnginePage
from PySide6.QtWebEngineWidgets import QWebEngineView


class MainWindow(QMainWindow):

    def __init__(self):
        super().__init__()

        self.setWindowTitle('ColorTransferLab v2.0.0')

        #self.toolBar = QToolBar()
        #self.addToolBar(self.toolBar)
        #self.backButton = QPushButton()
        #self.backButton.setIcon(QIcon(':/qt-project.org/styles/commonstyle/images/left-32.png'))
        #self.backButton.clicked.connect(self.back)
        #self.toolBar.addWidget(self.backButton)
        #self.forwardButton = QPushButton()
        #self.forwardButton.setIcon(QIcon(':/qt-project.org/styles/commonstyle/images/right-32.png'))
        #self.forwardButton.clicked.connect(self.forward)
        #self.toolBar.addWidget(self.forwardButton)

        #self.addressLineEdit = QLineEdit()
        #self.addressLineEdit.returnPressed.connect(self.load)
        #self.toolBar.addWidget(self.addressLineEdit)

        self.webEngineView = QWebEngineView()
        self.setCentralWidget(self.webEngineView)
        initialUrl = 'http://qt.io'
        #initialUrl = 'http://192.168.178.182:3000/ColorTransferLab'
        #self.addressLineEdit.setText(initialUrl)
        self.webEngineView.load(QUrl(initialUrl))
        #self.webEngineView.page().titleChanged.connect(self.setWindowTitle)
        #self.webEngineView.page().urlChanged.connect(self.urlChanged)

    @Slot()
    def load(self):
        url = QUrl.fromUserInput(self.addressLineEdit.text())
        if url.isValid():
            self.webEngineView.load(url)

    @Slot()
    def back(self):
        self.webEngineView.page().triggerAction(QWebEnginePage.Back)

    @Slot()
    def forward(self):
        self.webEngineView.page().triggerAction(QWebEnginePage.Forward)

    @Slot(QUrl)
    def urlChanged(self, url):
        self.addressLineEdit.setText(url.toString())

    def closeEvent(self, event):
        event.accept() # let the window close
        os.system("npm stop")
        os.system("kill -9 $(lsof -t -i:8001)")


if __name__ == '__main__':
    app = QApplication(sys.argv)
    mainWin = MainWindow()
    availableGeometry = mainWin.screen().availableGeometry()
    mainWin.resize(availableGeometry.width() * 2 / 3, availableGeometry.height() * 2 / 3)
    mainWin.show()
    sys.exit(app.exec())