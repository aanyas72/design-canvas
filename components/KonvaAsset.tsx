"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, Group, Image, Line, Path, Rect, Transformer } from "react-konva";
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
  readOnly?: boolean;
}

export default function KonvaAsset({ item, isSelected, onSelect, onChange, readOnly = false }: Props) {
  const shapeRef = useRef<Konva.Node>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const r = item.render;
  const c = item.color;
  const [svgImage, setSvgImage] = useState<HTMLImageElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const svgTextRef = useRef<string | null>(null);

  // Fetch SVG text once per URL
  useEffect(() => {
    if (r.type !== "svg") return;
    svgTextRef.current = null;
    fetch(r.svg_url).then((res) => res.text()).then((text) => {
      svgTextRef.current = text;
      applyColor(text, c ?? "#ffffff", true);
    });
  }, [r.type === "svg" ? r.svg_url : null]);

  // Recolor without re-fetching when color changes
  useEffect(() => {
    if (r.type !== "svg" || !svgTextRef.current) return;
    applyColor(svgTextRef.current, c ?? "#ffffff");
  }, [c]);

  function applyColor(text: string, color: string, firstLoad = false) {
    const colored = text
      .replace(/fill="(?!none\b)[^"]+"/gi, `fill="${color}"`)
      .replace(/fill:\s*(?!none\b)[^;}"]+/gi, `fill:${color}`)
      .replace(/stroke="(?!none\b)[^"]+"/gi, `stroke="${color}"`)
      .replace(/stroke:\s*(?!none\b)[^;}"]+/gi, `stroke:${color}`)
      .replace(/<svg\b(?![^>]*\bfill=)/i, `<svg fill="${color}"`);
    const blob = new Blob([colored], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      setSvgImage(img);
      if (firstLoad) {
        const MAX = 300;
        const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
        setNaturalSize({ w: img.naturalWidth * scale, h: img.naturalHeight * scale });
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  // Force Konva to redraw after image loads
  useEffect(() => {
    if (svgImage && shapeRef.current) {
      shapeRef.current.getLayer()?.batchDraw();
    }
  }, [svgImage]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const commonProps = {
    x: item.x,
    y: item.y,
    draggable: !readOnly,
    onClick: readOnly ? undefined : onSelect,
    onTap: readOnly ? undefined : onSelect,
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
    if (r.type === "svg") {
      return (
        <Image
          ref={shapeRef as React.RefObject<Konva.Image>}
          {...commonProps}
          image={svgImage ?? undefined}
          width={naturalSize?.w ?? r.width}
          height={naturalSize?.h ?? r.height}
        />
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