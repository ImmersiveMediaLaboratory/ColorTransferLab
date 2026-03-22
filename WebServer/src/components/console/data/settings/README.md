# Settings Components

This folder contains structural UI components responsible for the settings tab within the data tab.

---

## Overview

| Component | Responsibility |
|-----------|----------------|
| Settings  | Defines the layout |
| SettingsFieldItem  | One setting item for the loaded data. |

---

# Settings

## Purpose

Defines the layout.

---

## Props

| Name | Type | Description |
|------|------|----------|
| activeRenderer | string | Active renderer in mobile mode |
| settings | dict | Data type specific settings per Renderer. |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| --- | --- | --- |

---

## Internal Functions

None

---

# SettingsFieldItem

## Purpose

One setting item for the loaded data.

---

## Props

| Name | Type | Description |
|------|------|----------|
| type | string | input type: button, range etc. |
| defaultValue | ... | Default value |
| onChange | func | called if input changes |
| min | string | min value as string |
| max | string | max value as string |
| value | ... | Current values |
| children | string | name of the item |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| --- | --- | --- |

---

## Internal Functions

None
