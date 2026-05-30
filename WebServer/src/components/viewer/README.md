# Viewer Components

Responsible for the center view which displays the objects.

---

## Overview

| Component | Responsibility |
|-----------|----------------|
| View  | Defines the layout |
| ViewHeader  | Button container |


---

# View

## Purpose

Defines the layout

---

## Props

| Name | Type | Description |
|------|------|----------|
| setSettings | func | Setter for settings |
| setColorHistogram2D | func | Setter for colorHistogram2D |
| setMeshTexture | func | setter for meshTexture |
| outputModifications | dict | HBS modification parameter for the output |
| semanticMaps | dict | Blob-URL of the locally saved semantic map per Renderer (SRC and REF only) |
| isUserStudyOpen | bool | Indicates whether the User Study Panel is open. |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| showTop | bool | Indicates if Source Renderer is visible |
| showBottom | bool | Indicates if Reference Renderer is visible |
| showRight | bool | Indicates if Output Renderer is visible |
| activeMobile | string | Indicates the active renderer in mobile mode. Either "top", "bottom" or "right" |
| leftWidth | int | Width of the Source/Reference Renderer |
| topHeight | int | Height of the Source Renderer |
| area1File | string | Path of the source object |
| area2File | string | Path of the reference object |
| areaOutFile | string | Path of the output object |
| activeDownload | dict | Boolean per renderer indicating if a file is currently downloaded |
| isDraggingOverArea1 | bool | Indicates if an object is dragged over the source renderer |
| isDraggingOverArea2 | bool | Indicates if an object is dragged over the reference renderer |
| isDraggingOverAreaOut | bool | Indicates if an object is dragged over the output renderer |
| downloadInProgress| boolean | Indicater if any file is donwloaded |


---

## Internal Functions

### handleMouseMove(e)

Mouse move handler for chaning the widths and heights of the renderers.

### stopDragging()

Mouse up and mouse leave handler for stopping the size chaning of the renderers.

---

# ViewHeader

## Purpose

Button container

---

## Props

| Name | Type | Description |
|------|------|----------|
| viewButtons | list | Indicates for each renderer if active |
| setActiveDownload | func | Setter for activeDownload |
| setActiveMobile | func | Setter for activeMobile |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| --- | --- | --- |


---

## Internal Functions

### handleClickRun(e)

Sends the color transfer request to the Compute Node