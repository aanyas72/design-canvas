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
    <div
      ref={containerRef}
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#030712",
      }}
    >
      {items.length === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            userSelect: "none",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: 1,
              height: 64,
              background: "linear-gradient(to bottom, transparent, #404040)",
            }}
          />
          <p style={{ color: "#525252", fontSize: "14px" }}>
            Click an asset to place it
          </p>
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
