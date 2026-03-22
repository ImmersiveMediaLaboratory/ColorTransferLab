# Layout Components

This folder contains structural UI components responsible for the layout. It includes also header, footer and the feedback window.

---

## Overview

| Component | Responsibility |
|-----------|----------------|
| Layout  | Defines the layout |
| Header  | Shows client information and contains buttons for enable/disable areas in desktop mode |
| Footer  | Copyright information and buttons for changing the view in mobile mode |
| Feedback  | Sending feedback to the signalling server |

---

# Layout

## Purpose

Defines the general layout of this app.

---

## Props

| Name | Type | Description |
|------|------|----------|
| --- | --- | --- |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| settings | dict | Data type specific settings per Renderer. |
| colorDistribution | dict | Color distribution per Renderer |
| colorHistogram3D | dict | 3D Color Histogram per Renderer |
| meshTexture | dict | Blob-URL of the locally saved texture map per Renderer |
| semanticMaps | dict | Blob-URL of the locally saved semantic map per Renderer (SRC and REF only) |
| colorHistogram2D | dict | 2D Color Histogram per Renderer (with mean and stdDev)  |
| outputModifications | dict | HBS modification parameter for the output |
| leftWidth | int | Width of the left sidebar (Algorithms) |
| rightWidth | int | Width of the right sidebar (Database) |
| centerBottomHeight | int | Height of the Console-Component |
| rightBottomHeight | int | Height of the Server-Component |
| activePanel | string | Visible panel in mobile mode (either "left", "right", "center") |
| showLeft | bool | Indicates whether left sidebar ist visible in desktop mode. |
| showRight | bool | Indicates whether right sidebar ist visible in desktop mode. |
| showBottom | bool | Indicates whether console ist visible in desktop mode. |
| isUserStudyOpen | bool | Indicates whether the User Study Panel is open. |

---

## Internal Functions

### handleMouseMove(e)

Mouse move handler for chaning the widths and heights of the panels.

### stopDragging()

Mouse up and mouse leave handler for stopping the size chaning of the panels.

---

# Header

## Purpose

- Shows client information (name and id)
- provides buttons to open the feedback window, to change to the user study panel, opens the ColorTransferLab GitHub page and to change the visibility of the sidebars and the console

---

## Props

| Name | Type | Description |
|------|------|----------|
| showLeft | bool | Indicates whether left sidebar ist visible in desktop mode. |
| setShowLeft | func | Setter for showLeft |
| showRight | bool | Indicates whether right sidebar ist visible in desktop mode. |
| setShowRight | func | Setter for showRight |
| showBottom | bool | Indicates whether console ist visible in desktop mode. |
| setShowBottom | func | Setter for showBottom  |
| setIsUserStudyOpen | func | Setter for isUserStudyOpen  |
| isUserStudyOpen | bool | Indicates whether the User Study Panel is open. |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| isFeedbackOpen | bool | Indicates whether the Feedback window is open |
| clientInfo | dict | Stores clinet id and name. |

---

## Internal Functions

### handleUserstudyClick()

Switch isUserStudyOpen state, which opens the User Study Admin Interface and changes the content of the console tabs.

### handleFeedbackClick()

Switch isFeedbackOpen state, which opens the Feedback Window.

### handleGithubClick()

Opens the ColorTransferLab GitHub Page in a new tab.

### handlePersonalClick()

Open Personal Website in a new tab.

---

# Footer

## Purpose

- shows copyright information
- in mobile mode: shows three button for switching between the panels

---

## Props

| Name | Type | Description |
|------|------|----------|
| activePanel | string | visible panel in mobile mode (either "left", "right", "center") |
| setActivePanel | bool | setter for activePanel |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| --- | --- | --- |

---

## Internal Functions

None

---

# Feedback

## Purpose

- sends feedback to the signalling server

---

## Props

| Name | Type | Description |
|------|------|----------|
| setIsFeedbackOpen | func | setter for isFeedbackOpen |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| feedbackTitle | string | Title of the feedback |
| feedbackText | string | Content of the feedback |

---

## Internal Functions

### handleFeedbackClose()

Closes the feedback window and resets the title and content.

### handleFeedbackSend()

Send feedback to Signalling Server.