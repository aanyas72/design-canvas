"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Asset, ASSET_DB } from "@/lib/assets";
import { CanvasItem } from "./KonvaAsset";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// Konva must be client-only
const CanvasStage = dynamic(() => import("./CanvasStage"), { ssr: false });

export default function CanvasPage() {
  const [palette, setPalette] = useState<Asset[]>(ASSET_DB.slice(0, 12));
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const idCounter = useRef(0);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        setItems((prev) => prev.filter((i) => i.instanceId !== selectedId));
        setSelectedId(null);
      }
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId]);

  const handleGenerate = (prompt: string, assets: Asset[]) => {
    setIsLoading(true);
    // Simulate network latency for when API is wired in
    setTimeout(() => {
      setPalette(assets);
      setSubmittedPrompt(prompt);
      setItems([]);
      setSelectedId(null);
      setIsLoading(false);
    }, 800);
  };

  const handleAddAsset = (asset: Asset) => {
    idCounter.current += 1;
    setItems((prev) => [
      ...prev,
      {
        ...asset,
        instanceId: `${asset.id}-${idCounter.current}`,
        x: 100 + Math.random() * Math.max(stageSize.width - 300, 200),
        y: 80 + Math.random() * Math.max(stageSize.height - 200, 150),
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    ]);
  };

  const handleChange = useCallback(
    (instanceId: string, updates: Partial<CanvasItem>) => {
      setItems((prev) =>
        prev.map((item) =>
          item.instanceId === instanceId ? { ...item, ...updates } : item
        )
      );
    },
    []
  );

  const handleDelete = () => {
    if (!selectedId) return;
    setItems((prev) => prev.filter((i) => i.instanceId !== selectedId));
    setSelectedId(null);
  };

  const handleSizeChange = useCallback((w: number, h: number) => {
    setStageSize({ width: w, height: h });
  }, []);

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      <Sidebar
        palette={palette}
        submittedPrompt={submittedPrompt}
        isLoading={isLoading}
        onGenerate={handleGenerate}
        onAddAsset={handleAddAsset}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <Topbar
          sessionName={submittedPrompt ? `"${submittedPrompt}"` : "Untitled session"}
          itemCount={items.length}
          hasSelection={!!selectedId}
          onDelete={handleDelete}
          onClear={() => { setItems([]); setSelectedId(null); }}
        />
        <CanvasStage
          items={items}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChange={handleChange}
          onSizeChange={handleSizeChange}
        />
      </main>
    </div>
  );
}
