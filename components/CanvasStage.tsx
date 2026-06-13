"use client";

import { useEffect, useRef, useCallback } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import KonvaAsset, { CanvasItem } from "./KonvaAsset";

interface Props {
  items: CanvasItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (instanceId: string, updates: Partial<CanvasItem>) => void;
  onSizeChange: (w: number, h: number) => void;
}

export default function CanvasStage({
  items,
  selectedId,
  onSelect,
  onChange,
  onSizeChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      onSizeChange(entry.contentRect.width, entry.contentRect.height);
    });
    ro.observe(el);
    onSizeChange(el.offsetWidth, el.offsetHeight);
    return () => ro.disconnect();
  }, [onSizeChange]);

  const stageSize = (() => {
    const el = containerRef.current;
    return { width: el?.offsetWidth ?? 800, height: el?.offsetHeight ?? 600 };
  })();

  return (
    <div ref={containerRef} className="flex-1 relative overflow-hidden bg-neutral-950">
      {items.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none gap-3">
          <div className="w-px h-16 bg-gradient-to-b from-transparent to-neutral-800" />
          <p className="text-neutral-700 text-sm">Click an asset to place it</p>
        </div>
      )}
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={(e: Konva.KonvaEventObject<MouseEvent>) => {
          if (e.target === e.target.getStage()) onSelect(null);
        }}
      >
        <Layer>
          {items.map((item) => (
            <KonvaAsset
              key={item.instanceId}
              item={item}
              isSelected={selectedId === item.instanceId}
              onSelect={() => onSelect(item.instanceId)}
              onChange={(updates) => onChange(item.instanceId, updates)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
