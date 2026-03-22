# Database Components

This folder contains structural UI components responsible for the right sidebar, which visualizes a file tree containing the dataset acquired from the Compute Node.

---

## Overview

| Component | Responsibility |
|-----------|----------------|
| Database  | Right sidebar  |
| FileTree  | File and folder structure |
| FileNode  | File or folder element within the file tree |

---

# Database

## Purpose

Visualize a right sidebar with searchbar, an add button and a content area for a file tree.

---

## Props

| Name | Type | Description |
|------|------|----------|
| isUserStudyOpen | bool | Indicates if the User Study Panel is open or not |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| database | list | Structure of database with folder and file names |
| search | string | Text of the search bar for filtering the file tree |

---

## Internal Functions

### chooseFile()

Allows the upload of local images and point clouds.

### handleAddButtonClick()

Calls the chooseFile function when the add button in the database header is clicked.