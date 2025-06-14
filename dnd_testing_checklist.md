# Drag and Drop Functionality Testing Checklist

**Objective:** To ensure the drag-and-drop (DND) functionality using `@dnd-kit` is working correctly, smoothly, and all edge cases are handled gracefully.

**Prerequisites:**
*   Have at least 3-5 tasks in each column ('Plan', 'Doing', 'Done') to facilitate testing.
*   Ensure tasks have varying content (names, descriptions, dates) for better visual distinction.

---

## 1. Smoothness of Drag

| Test Scenario ID | Action                                                                 | Expected Outcome                                                                    |
| :--------------- | :--------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| SM-01            | Click and drag a task item within its column.                          | The item follows the cursor smoothly without jitter or significant lag.             |
| SM-02            | Click and drag a task item into an adjacent column.                    | The item follows the cursor smoothly across column boundaries.                      |
| SM-03            | Drag an item over various parts of other tasks and column areas.       | Visual feedback (placeholder, item style) updates promptly and smoothly.            |

---

## 2. Placement Accuracy (Same Column)

| Test Scenario ID | Action                                                                          | Expected Outcome                                                                                                |
| :--------------- | :------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------- |
| PS-01            | In a column with 3+ tasks, drag Task A from the top and drop it above Task B (middle). | Task A moves to the position just before Task B. Order is correctly updated.                                     |
| PS-02            | Drag Task C from the bottom and drop it between Task A and Task B (middle).       | Task C moves to the position between Task A and Task B. Order is correctly updated.                            |
| PS-03            | Drag a middle Task B and drop it at the very top of the column.                 | Task B moves to the first position in the column. Order is correctly updated.                                  |
| PS-04            | Drag a middle Task B and drop it at the very bottom of the column.                | Task B moves to the last position in the column. Order is correctly updated.                                   |
| PS-05            | Drag Task A and drop it onto itself (its original position).                    | No change in order or state. `handleDragEnd` should ideally not perform an update if `active.id === over.id`. |

---

## 3. Placement Accuracy (Different Column)

| Test Scenario ID | Action                                                                                                | Expected Outcome                                                                                                                                                 |
| :--------------- | :---------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PD-01            | Drag Task A from 'Plan' and drop it onto the header/empty area of 'Doing' column.                       | Task A is removed from 'Plan' and added to the end of 'Doing'. Order in both columns is correct.                                                                 |
| PD-02            | Drag Task B from 'Doing' and drop it onto the first task of 'Done' column.                              | Task B is removed from 'Doing' and inserted at the beginning (or just before the target task) of 'Done'. Order in both columns is correct.                          |
| PD-03            | Drag Task C from 'Plan' and drop it between two tasks (Task X and Task Y) in 'Doing' column.            | Task C is removed from 'Plan' and inserted between Task X and Task Y in 'Doing'. Order in both columns is correct.                                               |
| PD-04            | Drag Task D from 'Done' and drop it at the very end of 'Plan' column (by hovering below the last task). | Task D is removed from 'Done' and added as the last item in 'Plan'. Order in both columns is correct.                                                          |
| PD-05            | Drag a task to an empty column (e.g., 'Done' is empty, drag from 'Plan' to 'Done').                     | Task is moved to the 'Done' column, becoming its only item.                                                                                                     |

---

## 4. Moving from Last to First (Long List)

| Test Scenario ID | Action                                                                                                | Expected Outcome                                                                                               |
| :--------------- | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| LF-01            | In a column ('Doing') with 5+ items, drag the *last* item and move it to become the *first* item.        | The item moves to the top of the 'Doing' column smoothly. The list scrolls appropriately if needed during drag. |
| LF-02            | In a column ('Plan') with 5+ items, drag the *first* item and move it to become the *last* item.         | The item moves to the bottom of the 'Plan' column smoothly. The list scrolls appropriately if needed.          |

---

## 5. Visual Feedback

| Test Scenario ID | Action                                                                     | Expected Outcome                                                                                                                               |
| :--------------- | :------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| VF-01            | Start dragging a task.                                                     | The dragged task item's opacity changes to ~0.8, it gains a subtle box shadow, and its z-index increases (appears "lifted"). Cursor is 'grab'. |
| VF-02            | While dragging Task A from 'Plan', hover over 'Doing' column.              | The 'Doing' column's background subtly changes (e.g., to `bg-gray-700/50`) indicating it's a valid drop target. 'Plan' column does not highlight. |
| VF-03            | While dragging Task A within 'Plan', hover over other tasks in 'Plan'.     | No background change for 'Plan' column itself (as it's the source). A placeholder/gap should appear where the item will be dropped.         |
| VF-04            | Release the dragged task.                                                  | Task returns to normal opacity (1), no box shadow, normal z-index. Target column highlight (if any) is removed.                               |

---

## 6. Edge Cases

| Test Scenario ID | Action                                                                                 | Expected Outcome                                                                                                                                 |
| :--------------- | :------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| EC-01            | Drag a task and drop it very quickly within the same column or to another column.      | The task moves to the correct position without errors. State updates correctly.                                                                  |
| EC-02            | Drag a task and drop it outside of any valid column area (e.g., on the page background). | The task returns to its original position in its original column. No errors. `activeTaskId` is cleared. `console.log` shows "Drag ended outside..." |
| EC-03            | Attempt to drag a non-draggable element (e.g., column header, "Add Task" button).      | These elements should not be draggable. No DND operation starts.                                                                                 |
| EC-04            | Have an empty column, drag a task into it.                                             | Task successfully moves to the empty column.                                                                                                   |
| EC-05            | Drag the only task out of a column, making it empty.                                   | Task successfully moves to another column. The source column is now empty.                                                                       |

---

## 7. Persistence

| Test Scenario ID | Action                                                                    | Expected Outcome                                                                                     |
| :--------------- | :------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------- |
| P-01             | Reorder several tasks within 'Plan' column.                               | Changes are reflected in the UI.                                                                     |
| P-02             | Refresh the browser page after P-01.                                      | The reordered tasks in 'Plan' column maintain their new positions (loaded from localStorage).        |
| P-03             | Move a task from 'Doing' to 'Done'.                                       | Change is reflected in the UI.                                                                       |
| P-04             | Refresh the browser page after P-03.                                      | The task remains in 'Done' column (loaded from localStorage).                                        |
| P-05             | Perform a mix of reorders and moves. Close and reopen the browser.        | All changes are persisted and correctly restored.                                                    |

---

## 8. Keyboard Navigation (`@dnd-kit/sortable` built-in)

*   **Setup:** Click a task item to focus on it.
*   **Key Bindings (Common defaults for `sortableKeyboardCoordinates`):**
    *   **Spacebar/Enter:** To pick up a focused item.
    *   **Arrow Keys (Up/Down):** To move the picked-up item within the same sortable list.
    *   **Arrow Keys (Left/Right) or Tab/Shift+Tab (potentially):** To move the focused item or picked-up item to an adjacent sortable list (column). This might require specific setup or might depend on the overall page structure for focus management. Test if tabbing naturally moves focus between columns and then if items can be "sent" to other columns.
    *   **Escape:** To cancel a drag operation started via keyboard.
    *   **Spacebar/Enter (again):** To drop the item in its new position.

| Test Scenario ID | Action                                                                                                | Expected Outcome                                                                                                                                  |
| :--------------- | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| KN-01            | Focus on a task in 'Plan'. Press Spacebar/Enter.                                                      | Task is "picked up" (visual state might change slightly, e.g., screen readers announce it).                                                       |
| KN-02            | With a task picked up, press Down Arrow twice. Press Spacebar/Enter to drop.                          | Task moves down two positions in the same column. Order updates correctly.                                                                        |
| KN-03            | With a task picked up, press Up Arrow once. Press Spacebar/Enter to drop.                             | Task moves up one position in the same column. Order updates correctly.                                                                           |
| KN-04            | With a task picked up, press Escape.                                                                  | Drag operation is cancelled. Task returns to its original position.                                                                               |
| KN-05            | Focus on a task in 'Plan'. Pick it up. Attempt to move it to 'Doing' column using arrow keys (or Tab then arrows if applicable). Press Spacebar/Enter to drop. | Task moves from 'Plan' to 'Doing'. Order in both columns updates correctly. **Note:** Cross-container keyboard movement might need specific sensor/activator setup in dnd-kit beyond default sortable. Verify if this is working out-of-the-box. |
| KN-06            | After keyboard reordering/moving, verify changes with mouse dragging and vice-versa.                    | Operations are compatible. State remains consistent.                                                                                              |
| KN-07            | Verify persistence after keyboard operations (reload page).                                           | Changes made via keyboard are saved to localStorage and restored.                                                                                 |

---

This checklist should provide comprehensive coverage for testing the DND functionality.
The file `dnd_testing_checklist.md` has been created with this content.
```md
# Drag and Drop Functionality Testing Checklist

**Objective:** To ensure the drag-and-drop (DND) functionality using `@dnd-kit` is working correctly, smoothly, and all edge cases are handled gracefully.

**Prerequisites:**
*   Have at least 3-5 tasks in each column ('Plan', 'Doing', 'Done') to facilitate testing.
*   Ensure tasks have varying content (names, descriptions, dates) for better visual distinction.

---

## 1. Smoothness of Drag

| Test Scenario ID | Action                                                                 | Expected Outcome                                                                    |
| :--------------- | :--------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| SM-01            | Click and drag a task item within its column.                          | The item follows the cursor smoothly without jitter or significant lag.             |
| SM-02            | Click and drag a task item into an adjacent column.                    | The item follows the cursor smoothly across column boundaries.                      |
| SM-03            | Drag an item over various parts of other tasks and column areas.       | Visual feedback (placeholder, item style) updates promptly and smoothly.            |

---

## 2. Placement Accuracy (Same Column)

| Test Scenario ID | Action                                                                          | Expected Outcome                                                                                                |
| :--------------- | :------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------- |
| PS-01            | In a column with 3+ tasks, drag Task A from the top and drop it above Task B (middle). | Task A moves to the position just before Task B. Order is correctly updated.                                     |
| PS-02            | Drag Task C from the bottom and drop it between Task A and Task B (middle).       | Task C moves to the position between Task A and Task B. Order is correctly updated.                            |
| PS-03            | Drag a middle Task B and drop it at the very top of the column.                 | Task B moves to the first position in the column. Order is correctly updated.                                  |
| PS-04            | Drag a middle Task B and drop it at the very bottom of the column.                | Task B moves to the last position in the column. Order is correctly updated.                                   |
| PS-05            | Drag Task A and drop it onto itself (its original position).                    | No change in order or state. `handleDragEnd` should ideally not perform an update if `active.id === over.id`. |

---

## 3. Placement Accuracy (Different Column)

| Test Scenario ID | Action                                                                                                | Expected Outcome                                                                                                                                                 |
| :--------------- | :---------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PD-01            | Drag Task A from 'Plan' and drop it onto the header/empty area of 'Doing' column.                       | Task A is removed from 'Plan' and added to the end of 'Doing'. Order in both columns is correct.                                                                 |
| PD-02            | Drag Task B from 'Doing' and drop it onto the first task of 'Done' column.                              | Task B is removed from 'Doing' and inserted at the beginning (or just before the target task) of 'Done'. Order in both columns is correct.                          |
| PD-03            | Drag Task C from 'Plan' and drop it between two tasks (Task X and Task Y) in 'Doing' column.            | Task C is removed from 'Plan' and inserted between Task X and Task Y in 'Doing'. Order in both columns is correct.                                               |
| PD-04            | Drag Task D from 'Done' and drop it at the very end of 'Plan' column (by hovering below the last task). | Task D is removed from 'Done' and added as the last item in 'Plan'. Order in both columns is correct.                                                          |
| PD-05            | Drag a task to an empty column (e.g., 'Done' is empty, drag from 'Plan' to 'Done').                     | Task is moved to the 'Done' column, becoming its only item.                                                                                                     |

---

## 4. Moving from Last to First (Long List)

| Test Scenario ID | Action                                                                                                | Expected Outcome                                                                                               |
| :--------------- | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| LF-01            | In a column ('Doing') with 5+ items, drag the *last* item and move it to become the *first* item.        | The item moves to the top of the 'Doing' column smoothly. The list scrolls appropriately if needed during drag. |
| LF-02            | In a column ('Plan') with 5+ items, drag the *first* item and move it to become the *last* item.         | The item moves to the bottom of the 'Plan' column smoothly. The list scrolls appropriately if needed.          |

---

## 5. Visual Feedback

| Test Scenario ID | Action                                                                     | Expected Outcome                                                                                                                               |
| :--------------- | :------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| VF-01            | Start dragging a task.                                                     | The dragged task item's opacity changes to ~0.8, it gains a subtle box shadow, and its z-index increases (appears "lifted"). Cursor is 'grab'. |
| VF-02            | While dragging Task A from 'Plan', hover over 'Doing' column.              | The 'Doing' column's background subtly changes (e.g., to `bg-gray-700/50`) indicating it's a valid drop target. 'Plan' column does not highlight. |
| VF-03            | While dragging Task A within 'Plan', hover over other tasks in 'Plan'.     | No background change for 'Plan' column itself (as it's the source). A placeholder/gap should appear where the item will be dropped.         |
| VF-04            | Release the dragged task.                                                  | Task returns to normal opacity (1), no box shadow, normal z-index. Target column highlight (if any) is removed.                               |

---

## 6. Edge Cases

| Test Scenario ID | Action                                                                                 | Expected Outcome                                                                                                                                 |
| :--------------- | :------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| EC-01            | Drag a task and drop it very quickly within the same column or to another column.      | The task moves to the correct position without errors. State updates correctly.                                                                  |
| EC-02            | Drag a task and drop it outside of any valid column area (e.g., on the page background). | The task returns to its original position in its original column. No errors. `activeTaskId` is cleared. `console.log` shows "Drag ended outside..." |
| EC-03            | Attempt to drag a non-draggable element (e.g., column header, "Add Task" button).      | These elements should not be draggable. No DND operation starts.                                                                                 |
| EC-04            | Have an empty column, drag a task into it.                                             | Task successfully moves to the empty column.                                                                                                   |
| EC-05            | Drag the only task out of a column, making it empty.                                   | Task successfully moves to another column. The source column is now empty.                                                                       |

---

## 7. Persistence

| Test Scenario ID | Action                                                                    | Expected Outcome                                                                                     |
| :--------------- | :------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------- |
| P-01             | Reorder several tasks within 'Plan' column.                               | Changes are reflected in the UI.                                                                     |
| P-02             | Refresh the browser page after P-01.                                      | The reordered tasks in 'Plan' column maintain their new positions (loaded from localStorage).        |
| P-03             | Move a task from 'Doing' to 'Done'.                                       | Change is reflected in the UI.                                                                       |
| P-04             | Refresh the browser page after P-03.                                      | The task remains in 'Done' column (loaded from localStorage).                                        |
| P-05             | Perform a mix of reorders and moves. Close and reopen the browser.        | All changes are persisted and correctly restored.                                                    |

---

## 8. Keyboard Navigation (`@dnd-kit/sortable` built-in)

*   **Setup:** Click a task item to focus on it.
*   **Key Bindings (Common defaults for `sortableKeyboardCoordinates`):**
    *   **Spacebar/Enter:** To pick up a focused item.
    *   **Arrow Keys (Up/Down):** To move the picked-up item within the same sortable list.
    *   **Arrow Keys (Left/Right) or Tab/Shift+Tab (potentially):** To move the focused item or picked-up item to an adjacent sortable list (column). This might require specific setup or might depend on the overall page structure for focus management. Test if tabbing naturally moves focus between columns and then if items can be "sent" to other columns.
    *   **Escape:** To cancel a drag operation started via keyboard.
    *   **Spacebar/Enter (again):** To drop the item in its new position.

| Test Scenario ID | Action                                                                                                | Expected Outcome                                                                                                                                  |
| :--------------- | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| KN-01            | Focus on a task in 'Plan'. Press Spacebar/Enter.                                                      | Task is "picked up" (visual state might change slightly, e.g., screen readers announce it).                                                       |
| KN-02            | With a task picked up, press Down Arrow twice. Press Spacebar/Enter to drop.                          | Task moves down two positions in the same column. Order updates correctly.                                                                        |
| KN-03            | With a task picked up, press Up Arrow once. Press Spacebar/Enter to drop.                             | Task moves up one position in the same column. Order updates correctly.                                                                           |
| KN-04            | With a task picked up, press Escape.                                                                  | Drag operation is cancelled. Task returns to its original position.                                                                               |
| KN-05            | Focus on a task in 'Plan'. Pick it up. Attempt to move it to 'Doing' column using arrow keys (or Tab then arrows if applicable). Press Spacebar/Enter to drop. | Task moves from 'Plan' to 'Doing'. Order in both columns updates correctly. **Note:** Cross-container keyboard movement might need specific sensor/activator setup in dnd-kit beyond default sortable. Verify if this is working out-of-the-box. |
| KN-06            | After keyboard reordering/moving, verify changes with mouse dragging and vice-versa.                    | Operations are compatible. State remains consistent.                                                                                              |
| KN-07            | Verify persistence after keyboard operations (reload page).                                           | Changes made via keyboard are saved to localStorage and restored.                                                                                 |

---

This checklist should provide comprehensive coverage for testing the DND functionality.
The file `dnd_testing_checklist.md` has been created with this content.
```
