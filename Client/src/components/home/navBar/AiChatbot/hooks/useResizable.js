import { useRef, useCallback, useState } from 'react';

export const useResizable = (dimensions, setDimensions) => {
  const [resizing, setResizing] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startDimensions = useRef({ width: 420, height: 600 });

  const handleMouseDown = useCallback((e) => {
    setResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startDimensions.current = { ...dimensions };
  }, [dimensions]);

  const handleMouseMove = useCallback((e) => {
    if (!resizing) return;
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    const newWidth = Math.min(
      Math.max(startDimensions.current.width - deltaX, 350),
      window.innerWidth * 0.96
    );
    const newHeight = Math.min(
      Math.max(startDimensions.current.height - deltaY, 450),
      window.innerHeight * 0.94
    );
    setDimensions({ width: newWidth, height: newHeight });
  }, [resizing, setDimensions]);

  const handleMouseUp = useCallback(() => {
    setResizing(false);
  }, []);

  return {
    resizing,
    startPos,
    startDimensions,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};