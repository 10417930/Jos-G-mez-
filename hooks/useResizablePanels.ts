import { useState, useCallback, useRef, useEffect } from 'react';

interface ResizablePanelOptions {
    initialExplorerWidth?: number;
    initialEditorHeight?: number;
    minExplorerWidth?: number;
    minEditorHeight?: number;
}

export default function useResizablePanels(options: ResizablePanelOptions = {}) {
    const {
        initialExplorerWidth = 280,
        initialEditorHeight = 500,
        minExplorerWidth = 150,
        minEditorHeight = 100
    } = options;

    const [explorerWidth, setExplorerWidth] = useState(initialExplorerWidth);
    const [editorHeight, setEditorHeight] = useState(initialEditorHeight);

    const isResizingVertical = useRef(false);
    const isResizingHorizontal = useRef(false);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizingVertical.current) {
            const newWidth = e.clientX - 48; // Adjust for the tool window bar width
            if (newWidth > minExplorerWidth) {
                setExplorerWidth(newWidth);
            }
        }
        if (isResizingHorizontal.current) {
            const newHeight = e.clientY - 45; // Adjust for header height
            const mainContentHeight = window.innerHeight - 45 - 30; // Header and status bar
            if (newHeight > minEditorHeight && newHeight < mainContentHeight - minEditorHeight) {
                setEditorHeight(newHeight);
            }
        }
    }, [minExplorerWidth, minEditorHeight]);

    const handleMouseUp = useCallback(() => {
        isResizingVertical.current = false;
        isResizingHorizontal.current = false;
        // Clean up classes that might disable text selection
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);
    
    const verticalDragHandleProps = {
        onMouseDown: (e: React.MouseEvent) => {
            e.preventDefault();
            isResizingVertical.current = true;
            document.body.style.userSelect = 'none'; // Prevent text selection while dragging
            document.body.style.cursor = 'col-resize';
        }
    };
    
    const horizontalDragHandleProps = {
        onMouseDown: (e: React.MouseEvent) => {
            e.preventDefault();
            isResizingHorizontal.current = true;
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'row-resize';
        }
    };

    return { explorerWidth, editorHeight, verticalDragHandleProps, horizontalDragHandleProps };
}