# Database Components

This folder contains structural UI components responsible for the right sidebar, which visualizes a file tree containing the dataset acquired from the Compute Node.

---

## Overview

| Component | Responsibility |
|-----------|----------------|
| Database  | Right sidebar  |
| Searchbar  | Searchbar for filtering the FileTree  |
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
| isUserStudyOpen | bool | Indicates if the User Study Panel is open. |

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

### filterTree(tree, query)

Filters the filetree based on the query from the searchbar.

---

# Searchbar

## Purpose

Allows the user to enter text used to filter the file tree.

---

## Props

| Name | Type | Description |
|------|------|----------|
| search | string | Text for filtering the file tree. Is previewed within the searchbar. |
| setSearch | func | Sets the search state from the Database component. |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| --- | --- | --- |

---

## Internal Functions

None

---

# FileTree

## Purpose

Visualizes the file and folder structure of the requested database.

---

## Props

| Name | Type | Description |
|------|------|----------|
| data | list | Structure of database with folder and file names |
| expandAll | bool | Indicates whether the file tree should be fully expanded. |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| --- | --- | --- |

---

## Internal Functions

### FileTreeContent(data expandAll)

Returns the file and folder structure as component.

### removeTmpFolders(data)

Returns the database without tmp folders.

---

# FileNode

## Purpose

Single file or folder element within the FileTree

---

## Props

| Name | Type | Description |
|------|------|----------|
| node | ... | ... |
| parentPath | ... | ... |
| expandAll | bool | ... |
| isHiddenName | bool | ... |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| expanded | bool | --- |
| dragging | bool | --- |
| showMenu | bool | --- |
| menuPos | dict | Element position: { x: 0, y: 0 } |

---

## Internal Functions

### FileTreeContent(data expandAll)

Returns the file and folder structure as component.

### toggle()

Expands folders.

### getFileIcon(name)

Returns an MUI icon based on the file extension of the file in name.