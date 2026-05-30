# Console Components

This folder contains structural UI components responsible for the Console with its tabs: Terminal, Evaluation, Configuration, Datam Information

---

## Overview

| Component | Responsibility |
|-----------|----------------|
| Console | Providing tab buttons and the content area |
| ConsoleTabButton | Single Tab Button |
| Terminal | Print area for console.debug |
| Evaluation | Tables with Evaluation Metrics and Results |
| Configuration | Configuration table for selected algorithm |
| Information | Text area for information of the selected algorithm |

---

# Console

## Purpose

Area below the main view providing multiple tabs.

---

## Props

| Name | Type | Description |
|------|------|----------|
| settings | dict | Data type specific settings per Renderer. |
| colorDistribution | dict | Color distribution per Renderer. |
| colorHistogram2D | dict | 2D Color Histogram per Renderer (with mean and stdDev) |
| colorHistogram3D | dict | 3D Color Histogram per Renderer |
| meshTexture | dict | Blob-URL of the locally saved texture map per Renderer |
| setOutputModifications | func | Setter for outputModifications. |
| semanticMaps | dict | Blob-URL of the locally saved semantic map per Renderer (SRC and REF only) |
| setSemanticMaps | func | Setter for semanticMaps |
| isUserStudyOpen | bool | Indicates whether the User Study Panel is open. |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| activeTab | string | ID of the clicked tab. See ConsoleTabButton for possible IDs. |

---

## Internal Functions

None

---

# ConsoleTabButton

## Purpose

Single Console Tab Button for enabling the corresponding content area. 

---

## Props

| Name | Type | Description |
|------|------|----------|
| activeTab | string | ID of the clicked tab. See ConsoleTabButton for possible IDs. |
| setActiveTab | func | Sette for activeTab. |
| isUserStudyOpen | bool | Indicates whether the User Study Panel is open. |
| children | string | Name of the Tab Button. |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| --- | --- | ... |

---

## Internal Functions

None

---

# Terminal

## Purpose

Output area for console.debug

---

## Props

| Name | Type | Description |
|------|------|----------|
| activeTab | string | ID of the clicked tab. See ConsoleTabButton for possible IDs. |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| lines | list | console.debug outputs printed within the Terminal |

---

## Internal Functions

None

---

# Evaluation

## Purpose

Tables with Evaluation Metrics and Results

---

## Props

| Name | Type | Description |
|------|------|----------|
| activeTab | string | ID of the clicked tab. See ConsoleTabButton for possible IDs. |
| activeView | int | Index of the active view (1,2,3,4) |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| metricsResults | dict | contains the results for all metrics |

---

## Internal Functions

### formatRange(range)

If a metric has infinite: true in its range, display max as "∞" in the UI; otherwise display "min / max".

### getValueCellStyle(metricName, value)

Color Coding of cells based on value and metric-specific range/direction.

### handleCalculate(metricName)

Sends a request to the backend to calculate the specified metric for the currently selected source, reference, and output paths.

### handleCalculateAll()

Calculates all metrics. Calls handleCalculate for each metric in the current view.

### handleExport()

Exports all metrics results as JSON.

---

# Configuration

## Purpose

Table with Configuration parameters for the selected algorithm.

---

## Props

| Name | Type | Description |
|------|------|----------|
| activeTab | string | ID of the clicked tab. See ConsoleTabButton for possible IDs. |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| optionsList | dict | All options for all algorithms. |
| currentOption | string | All options for the selected algorithm. |

---

## Internal Functions

### handleValueChange(index, newValue)

Handle value change for a specific option

---

# Information

## Purpose

...

---

## Props

| Name | Type | Description |
|------|------|----------|
| activeTab | string | ID of the clicked tab. See ConsoleTabButton for possible IDs. |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| lines | list | Information, e.g., authors of the selected algorithm. |

---

## Internal Functions

None