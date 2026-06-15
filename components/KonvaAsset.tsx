"use client";

import { useEffect, useRef } from "react";
import { Circle, Group, Line, Path, Rect, Transformer } from "react-konva";
import Konva from "konva";
import { Asset } from "@/lib/assets";

export interface CanvasItem extends Asset {
  instanceId: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  color?: string;
}

interface Props {
  item: CanvasItem;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CanvasItem>) => void;
}

export default function KonvaAsset({ item, isSelected, onSelect, onChange }: Props) {
  const shapeRef = useRef<Konva.Node>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const r = item.render;
  const c = item.color;

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const commonProps = {
    x: item.x,
    y: item.y,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    scaleX: item.scaleX,
    scaleY: item.scaleY,
    rotation: item.rotation,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      onChange({ x: e.target.x(), y: e.target.y() });
    },
    onTransformEnd: () => {
      const node = shapeRef.current!;
      onChange({
        x: node.x(),
        y: node.y(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
        rotation: node.rotation(),
      });
    },
  };

  const shapeNode = (() => {
    if (r.type === "path") {
      const hasFill = r.fill && r.fill !== "transparent";
      return (
        <Path
          ref={shapeRef as React.RefObject<Konva.Path>}
          {...commonProps}
          data={r.d}
          fill={hasFill ? (c ?? r.fill) : "transparent"}
          stroke={c && !hasFill ? c : (r.stroke ?? (c || undefined))}
          strokeWidth={r.strokeWidth}
        />
      );
    }
    if (r.type === "circle") {
      const hasFill = r.fill && r.fill !== "transparent";
      return (
        <Circle
          ref={shapeRef as React.RefObject<Konva.Circle>}
          {...commonProps}
          radius={r.radius}
          fill={hasFill ? (c ?? r.fill) : "transparent"}
          stroke={c && !hasFill ? c : (r.stroke ?? (c || undefined))}
          strokeWidth={r.strokeWidth}
        />
      );
    }
    if (r.type === "line") {
      return (
        <Line
          ref={shapeRef as React.RefObject<Konva.Line>}
          {...commonProps}
          points={r.points}
          stroke={c ?? r.stroke}
          strokeWidth={r.strokeWidth}
          lineCap="round"
          lineJoin="round"
        />
      );
    }
    if (r.type === "rect") {
      return (
        <Rect
          ref={shapeRef as React.RefObject<Konva.Rect>}
          {...commonProps}
          width={r.width}
          height={r.height}
          fill={c ?? r.fill}
          cornerRadius={r.rx}
        />
      );
    }
    if (r.type === "dots") {
      return (
        <Group ref={shapeRef as React.RefObject<Konva.Group>} {...commonProps}>
          {r.positions.map(([x, y], i) => (
            <Circle key={i} x={x} y={y} radius={r.radius} fill={c ?? r.fill} />
          ))}
        </Group>
      );
    }
    if (r.type === "cross") {
      return (
        <Group ref={shapeRef as React.RefObject<Konva.Group>} {...commonProps}>
          <Line
            points={[10, 10, r.width - 10, r.height - 10]}
            stroke={c ?? r.stroke}
            strokeWidth={r.strokeWidth}
            lineCap="round"
          />
          <Line
            points={[r.width - 10, 10, 10, r.height - 10]}
            stroke={c ?? r.stroke}
            strokeWidth={r.strokeWidth}
            lineCap="round"
          />
        </Group>
      );
    }
    return null;
  })();

  return (
    <>
      {shapeNode}
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          keepRatio={false}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 20 || newBox.height < 20 ? oldBox : newBox
          }
        />
      )}
    </>
  );
}