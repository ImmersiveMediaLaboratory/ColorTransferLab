# Server

## Purpose

- Shows buttons for each available compute node
- For connecting / disconnecting to the compute node
- sets password for compute node

---

## Props

| Name | Type | Description |
|------|------|----------|
| rightBottomHeight | string | Height of the Server-Component |

---

## Internal State

| Name | Type | Description |
|------|------|------------|
| computeNodes | . | . |
| connectedKey | . | . |
| password | string | . |

---

## Internal Functions

### handlePasswordChange(e)

Update password state.

### handleEntryClick()

Create offer for connecting to Compute Node.

### handleDisconnect()

Dicsonnects from Compute Node.