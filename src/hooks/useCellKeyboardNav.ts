import * as React from "react";

type Opts = {
    getTotalCols: () => number;
    getRowCount: () => number;
    /** Called when user moves past the last loaded row so can fetch more */
    onReachEndRow?: () => Promise<void> | void;
};

type CellProps = {
    "data-cell-row": number;
    "data-cell-col": number;
    tabIndex: number;
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
};

export function useCellKeyboardNav({ getTotalCols, getRowCount, onReachEndRow }: Opts) {
    const focusCell = React.useCallback((r: number, c: number) => {
        const sel = `[data-cell-row="${r}"][data-cell-col="${c}"]`;
        const el = document.querySelector<HTMLElement>(sel);
        el?.focus();
    }, []);

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    const move = React.useCallback(
        async (curR: number, curC: number, dR: number, dC: number) => {
            const rows = getRowCount();
            const cols = getTotalCols();

            let nextR = curR + dR;
            let nextC = curC + dC;

            // Horizontal wrap within a row (Left/Right, Tab)
            if (nextC < 0) {
                nextR = curR - 1;
                nextC = cols - 1;
            } else if (nextC >= cols) {
                nextR = curR + 1;
                nextC = 0;
            }

            // If moving past last loaded row, ask caller to load more
            if (nextR >= rows && onReachEndRow) {
                await onReachEndRow();
            }

            // Recompute after potential load
            const rows2 = getRowCount();
            nextR = clamp(nextR, 0, Math.max(0, rows2 - 1));
            nextC = clamp(nextC, 0, Math.max(0, cols - 1));

            focusCell(nextR, nextC);
        },
        [focusCell, getRowCount, getTotalCols, onReachEndRow]
    );

    const onKeyDownAsync = React.useCallback(
        async (e: React.KeyboardEvent<HTMLElement>) => {
        const cell = e.currentTarget as HTMLElement;
        const r = Number(cell.getAttribute("data-cell-row"));
        const c = Number(cell.getAttribute("data-cell-col"));
        if (Number.isNaN(r) || Number.isNaN(c)) return;

        // Don’t hijack when user is selecting text with Shift+Arrow inside inputs
        const isTextInput =
            cell.tagName === "INPUT" || cell.tagName === "TEXTAREA" || cell.getAttribute("contenteditable") === "true";
        const selecting = isTextInput && e.shiftKey && (e.key === "ArrowLeft" || e.key === "ArrowRight");
        if (selecting) return;

        switch (e.key) {
            case "ArrowRight":
                e.preventDefault();
                await move(r, c, 0, +1);
                break;
            case "ArrowLeft":
                e.preventDefault();
                await move(r, c, 0, -1);
                break;
            case "ArrowDown":
                e.preventDefault();
                await move(r, c, +1, 0);
                break;
            case "ArrowUp":
                e.preventDefault();
                await move(r, c, -1, 0);
                break;
            case "Enter":
                e.preventDefault();
                await move(r, c, e.shiftKey ? -1 : +1, 0); // Enter ↓, Shift+Enter ↑
                break;
            case "Tab":
                e.preventDefault();
                await move(r, c, 0, e.shiftKey ? -1 : +1); // Tab →, Shift+Tab ←
                break;
            case "Home": {
                e.preventDefault();
                focusCell(r, 0);
                break;
            }
            case "End": {
                e.preventDefault();
                focusCell(r, getTotalCols() - 1);
                break;
            }
            default:
            break;
        }
        },
        [move, focusCell, getTotalCols]
    );

    const onKeyDown: React.KeyboardEventHandler<HTMLElement> = React.useCallback(
        (e) => {
            void onKeyDownAsync(e);
        },
        [onKeyDownAsync]
    );

    const getCellProps = React.useCallback(
            (rowIndex: number, colIndex: number): CellProps => ({
            "data-cell-row": rowIndex,
            "data-cell-col": colIndex,
            tabIndex: 0, // make the element focusable
            onKeyDown,
        }),
        [onKeyDown]
    );

    return { getCellProps, focusCell };
}
