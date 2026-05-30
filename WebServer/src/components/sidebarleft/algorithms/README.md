# Algorithms Components

Left sidebar containing three tabs (Color Transfer, Style Transfer, and Colorization). Each tab provides buttons to enable the corresponding algorithm.

---

## Overview

| Component | Responsibility |
|------------|----------------|
| Algorithm  | Sidebar with three tabs. |
| AlgorithmTabContent | Shows buttons for each algorithm. |
| AlgorithmButton   | Activates the corresponding algorithm. |

---

# Algorithm

Left sidebar with three tabs each activating a different content area.

---

## Purpose

- Left sidebar
- Show three tabs

---

## Props

| Name | Type | Description |
|------|------|------------|
| activePanel | string | Active panel in mobile mode. Either: "left", "right", "center" |
| showLeft | bool | Indicates if the sidebar is visible |
| leftWidth | int | Width of the sidebar |
| isUserStudyOpen | bool | Indicates if the User Study Panel is open. |

---

## Internal State

| Variable | Type | Description |
|----------|------|------------|
| activeTab | string | Indicates the active Tab. Either "a", "b" or "c" |
| algorithmsList | list | List of the algorithms requested from the Compute Node |

---

## Internal Functions

None

---

# AlgorithmTabContent

Content area with a button for each available algorithm.

---

## Purpose

- area for buttons

---

## Props

| Name | Type | Description |
|------|------|------------|
| activeTab | string | Indicates the active Tab. Either "a", "b" or "c" |
| algorithmsList | list | List of the algorithms requested from the Compute Node |
| setSelectedAlgorithm | func | Sets the selected algorithm using its name |

---

## Internal State

| Variable | Type | Description |
|----------|------|------------|
| activeAlgo | string | Indicates the active algorithm. Example: "Reinhard01" |

---

## Internal Functions

### getMethodsByType(type)

Returns all methods which corresponds to a given type. Available types: "Color Transfer", "Style Transfer", "Colorization"

### handleAlgorithmClick(algo)

Activates the clicked algorithm and prints algorithm's information within the Information-Tab.

### getIconHtmlForDatatype(dt)

Return Icon for a specific data type.

---

# AlgorithmButton

Button for each algorithm requested from the Compute Node.

---

## Purpose

- activates the corresponding algorithm
- prints the algorithm information within the Information-Tab

---

## Props

| Name | Type | Description |
|------|------|------------|
| algo | ... | ... |
| onClick | func | ... |
| activeAlgo | ... | ... |

---

## Internal State

| Variable | Type | Description |
|----------|------|------------|
| --- | --- | --- |

---

## Internal Functions

### getMethodsByType(type)

None