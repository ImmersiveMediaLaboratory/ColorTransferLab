# Data Components

Responsible for additional data visualization, e.g., Histograms, texture maps, and data manipulation.

---

## Overview

| Component | Responsibility |
|-----------|----------------|
| Data  | Layout component with main view and right sidebar |
| ColorDistribution  | Visualizes the color distribution per Renderer |
| Histogram  | Visualizes the 2D color histogram per Renderer |
| Histogram3D  | Visualizes the 3D color histogram per Renderer |
| Info  | Shows data type specific information, e.g. dimensions for images |
| OutputAdjustment  | HSB semantic output manipulation |
| Semantics  | Visualization of semantic maps |
| SemanticsList  | List of available semantic classes |
| Textures  | Visualizaiton of texture maps for meshes and volumetric videos. |

---

# Data

## Purpose

Container for providing different views. The views can be changed using the right sidebar.

---

## Props

| Name | Type | Description |
|------|------|----------|
| activeTab | string | ID of the clicked tab. See ConsoleTabButton for possible IDs. |
| settings | dict | Data type specific settings per Renderer. |
| colorDistribution | dict | Color distribution per Renderer as BufferAttribute |
| colorHistogram2D | dict | 2D Color Histogram per Renderer (with mean and stdDev) |
| colorHistogram3D | dict | 3D Color Histogram per Renderer |
| meshTexture | dict | Blob-URL of the locally saved texture map per Renderer |
| setOutputModifications | func | setter for outputModifications |
| semanticMaps | dict | Blob-URL of the locally saved semantic map per Renderer (SRC and REF only) |
| setSemanticMaps | func | setter for semanticMaps |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| activeView | int | Index of the active view in the data tab |
| activeRenderer | string | Active renderer in mobile mode |

---

## Internal Functions

None

---

# ColorDistribution

## Purpose

- visualizes color distribution in a 3D RGB coordinate system

---

## Props

| Name | Type | Description |
|------|------|----------|
| activeRenderer | string | Active renderer in mobile mode |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| ... | ... | ... |

---

## Internal Functions

None

---

# Histogram

## Purpose

Draws per Renderer a 2D color histogram.

---

## Props

| Name | Type | Description |
|------|------|----------|
| activeRenderer | string | Active renderer in mobile mode |
| colorHistogram2D | dict | 2D Color Histogram per Renderer (with mean and stdDev) |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| ... | ... | ... |

---

## Internal Functions

### updateHistogram(histogram, canvas)

Draws the histogram data onto the canvas.

### setPixel(x, y, w, h, image, r, g, b, val)

Sets a pixel in the image data.

---

# Histogram3D

## Purpose

Draws per Renderer a 3D color histogram.

---

## Props

| Name | Type | Description |
|------|------|----------|
| activeRenderer | string | Active renderer in mobile mode |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| --- | --- | --- |

---

## Internal Functions

None

---

# Info

## Purpose

Prints data type specific information. For example: Dimensions for images.

---

## Props

| Name | Type | Description |
|------|------|----------|
| activeRenderer | string | Active renderer in mobile mode |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| srcLines | list | Contains one string element, which defines the html information of the source object |
| refLines | list | Contains one string element, which defines the html information of the reference object |
| outLines | list | Contains one string element, which defines the html information of the output object |

---

## Internal Functions

None

---

# OutputAdjustment

## Purpose

HSB adjustment of the output image for semantic layers.

---

## Props

| Name | Type | Description |
|------|------|----------|
| setOutputModifications | func | Setter for outputModifications |
| semanticMaps | dict | Blob URLs to the src and ref semantic maps |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| activeIdx | int | Index of the selected semantic layer |
| semanticValues | dict | HSB values per semantic label |

---

## Internal Functions

### handleValueChange (key, value)

Changes the value of th HSB sliders for output modification.

---

# Semantics

## Purpose

....

---

## Props

| Name | Type | Description |
|------|------|----------|
| activeRenderer | string | Active renderer in mobile mode |
| setSemanticMaps | func | Setter for semanticMaps |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| srcSemantics | bool | Blob URL for the semantic map of the src image |
| refSemantics | bool | Blob URL for the semantic map of the ref image |
| srcLoading | bool | Inidicates if the semantic generation is in progress for the src image |
| refLoading | bool | Inidicates if the semantic generation is in progress for the ref image |

---

## Internal Functions

### handlerSemanticsShow(e)

Sets the semantic map in the semantic tab

### generateSemantics(slot)

Requests semantics generation

### handlerSemanticsAvailability(slot)

Requests the semantic map if available

---

# SemanticsList

## Purpose

List of available semantic classes

---

## Props

| Name | Type | Description |
|------|------|----------|
| --- | --- | --- |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| newName | string | name of the added class |
| newColor | string | color of the added class in hex |

---

## Internal Functions

### handleColorChange(index, newColor)

Changes the color of class in selectedSemanticList

### handleToggleEnabled(index)

Changes the enabled status of a class in selectedSemanticList

### handleAddSemantic()

Adds a new class (name and color) in selectedSemanticList

### handleRemove(index)

Removes a class from selectedSemanticList

### handleExportSemanticList()

Export the semantic list as JSON

### handleImportSemanticList()

Import the semantic list from JSON

---

# Textures

## Purpose

Visualizes the texture maps of meshes per Renderer

---

## Props

| Name | Type | Description |
|------|------|----------|
| activeRenderer | string | Active renderer in mobile mode |
| meshTexture | dict | Blob-URL of the locally saved texture map per Renderer |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| --- | --- | --- |

---

## Internal Functions

None