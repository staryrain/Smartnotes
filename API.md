# Smartnotes API Documentation

This document describes the IPC interfaces available between the Renderer process (Frontend) and the Main process (Backend).

## Communication Protocol
All requests are sent via `ipcRenderer.invoke(channel, ...args)`.
Responses are asynchronous promises returning the data or throwing an error.

## Tasks (DailyTask)

### `task:get`
- **Description**: Retrieve all today's tasks.
- **Parameters**: None
- **Returns**: `DailyTask[]`
- **Model**:
  ```ts
  interface DailyTask {
    id: string
    content: string
    status: 'PENDING' | 'COMPLETED'
    type: 'TODAY'
    createdAt: Date
  }
  ```

### `task:create`
- **Description**: Create a new task for today.
- **Parameters**: `content: string`
- **Returns**: `DailyTask`

### `task:updateStatus`
- **Description**: Update task status.
- **Parameters**: `id: string`, `status: 'PENDING' | 'COMPLETED'`
- **Returns**: `DailyTask`

### `task:delete`
- **Description**: Delete a task.
- **Parameters**: `id: string`
- **Returns**: `DailyTask`

## Plans (Tomorrow's Tasks)

### `plan:get`
- **Description**: Retrieve all plans for tomorrow.
- **Parameters**: None
- **Returns**: `DailyTask[]` (where type is 'PLAN_TOMORROW')

### `plan:create`
- **Description**: Create a plan for tomorrow.
- **Parameters**: `content: string`
- **Returns**: `DailyTask`
- **Note**: `planDate` is automatically set to tomorrow 06:00.

### `plan:delete`
- **Description**: Delete a plan.
- **Parameters**: `id: string`
- **Returns**: `DailyTask`

## Long Term Goals

### `longterm:get`
- **Description**: Retrieve all long-term goals.
- **Parameters**: None
- **Returns**: `LongTermGoal[]`

### `longterm:create`
- **Description**: Create a long-term goal.
- **Parameters**: `content: string`
- **Returns**: `LongTermGoal`

### `longterm:updateStatus`
- **Description**: Update goal status.
- **Parameters**: `id: string`, `status: 'PENDING' | 'COMPLETED'`
- **Returns**: `LongTermGoal`

### `longterm:delete`
- **Description**: Delete a goal.
- **Parameters**: `id: string`
- **Returns**: `LongTermGoal`

## Achievements

### `achievement:get`
- **Description**: Retrieve all achievements.
- **Parameters**: None
- **Returns**: `Achievement[]`

### `achievement:create`
- **Description**: Record a new achievement.
- **Parameters**: `content: string`, `year: number`, `month: number`
- **Returns**: `Achievement`
- **Note**: `recordTime` is automatically generated (e.g., "10号 19点").

## Window Control

### `window:setIgnoreMouseEvents`
- **Description**: Toggle mouse click-through mode.
- **Parameters**: `ignore: boolean` (true = click-through, false = interactive)
- **Returns**: `void`

### `window:minimizeToTray`
- **Description**: Hide window to system tray.
- **Parameters**: None
- **Returns**: `void`

### `window:setOpacity`
- **Description**: Set window opacity.
- **Parameters**: `opacity: number` (0.0 - 1.0)
- **Returns**: `void`
