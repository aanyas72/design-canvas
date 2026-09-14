"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Asset, ASSET_DB, fetchRemoteAssets, filterAssets } from "@/lib/assets";
import { useCollabChannel } from "@/lib/useCollabChannel";
import { CanvasItem } from "./KonvaAsset";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const CanvasStage = dynamic(() => import("./CanvasStage"), { ssr: false });

const GENERATED_PROMPTS = [
  "morning fog and soft tension",
  "deep water at night",
  "speed and fragmented energy",
  "quiet structure and distance",
  "heavy pressure before a storm",
  "memory fading at dusk",
  "airy loops and calm weight",
  "sharp angles, bold contrast",
  "organic drift in soft light",
  "geometric stillness at dawn",
];

interface Props {
  roomId: string;
}

export default function CollabCanvasPage({ roomId }: Props) {
  const {
    items,
    prompt,
    matchedAssets,
    peers,
    ready,
    myIdentity,
    addItem,
    changeItem,
    deleteItem,
    clearItems,
    setPrompt,
    sendCursor,
  } = useCollabChannel(roomId);

  const [setupPrompt, setSetupPrompt] = useState("");
  const [remoteAssets, setRemoteAssets] = useState<Asset[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [copied, setCopied] = useState(false);
  const idCounter = useRef(0);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((i) => i.instanceId === selectedId);

  useEffect(() => {
    fetchRemoteAssets().then(setRemoteAssets);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!prompt) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        deleteItem(selectedId);
        setSelectedId(null);
      }
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prompt, selectedId, deleteItem]);

  const handleStart = () => {
    if (!setupPrompt.trim()) return;
    const matched = filterAssets(setupPrompt, remoteAssets).filter((a) => a.render.type === "svg");
    setPrompt(setupPrompt, matched);
  };

  const generateRandomPrompt = () => {
    const idx = Math.floor(Math.random() * GENERATED_PROMPTS.length);
    setSetupPrompt(GENERATED_PROMPTS[idx]);
  };

  const handleAddAsset = (asset: Asset) => {
    idCounter.current += 1;
    const item: CanvasItem = {
      ...asset,
      instanceId: `${myIdentity.clientId.slice(0, 8)}-${asset.id}-${idCounter.current}`,
      x: 100 + Math.random() * Math.max(stageSize.width - 300, 200),
      y: 80 + Math.random() * Math.max(stageSize.height - 200, 150),
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
    };
    addItem(item);
  };

  const handleSizeChange = useCallback((w: number, h: number) => {
    setStageSize({ width: w, height: h });
  }, []);

  const handleColorChange = (color: string) => {
    if (!selectedId) return;
    changeItem(selectedId, { color });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    sendCursor(e.clientX - rect.left, e.clientY - rect.top);
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}/canvas/collab/${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (!ready) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#030712", color: "#525252", fontSize: "13px" }}>
        Joining room…
      </div>
    );
  }

  if (!prompt) {
    return (
      <div style={{ display: "flex", height: "100vh", backgroundColor: "#030712", color: "#f5f5f5", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 420, display: "flex", flexDirection: "column", gap: "28px" }}>
          <div>
            <Link href="/" style={{ fontSize: "12px", color: "#525252", textDecoration: "none", display: "inline-block", marginBottom: "12px" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#a3a3a3"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#525252"; }}
            >← Home</Link>
            <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 4px", letterSpacing: "-0.01em" }}>Collaborative Canvas</h2>
            <p style={{ fontSize: "13px", color: "#525252", margin: 0 }}>You&rsquo;re first in this room — set a prompt to start</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#737373" }}>Prompt</label>
            <textarea
              autoFocus
              rows={3}
              value={setupPrompt}
              onChange={(e) => setSetupPrompt(e.target.value)}
              placeholder="morning fog, tension, energy…"
              style={{
                backgroundColor: "#0f0f0f",
                border: "1px solid #404040",
                borderRadius: "8px",
                color: "#f5f5f5",
                fontSize: "14px",
                padding: "12px",
                resize: "none",
                outline: "none",
                lineHeight: 1.5,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#505050"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#404040"; }}
            />
            <button
              onClick={generateRandomPrompt}
              style={{ alignSelf: "flex-start", fontSize: "11px", color: "#6366f1", background: "none", border: "none", padding: 0, cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#818cf8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#6366f1"; }}
            >
              ↺ Generate prompt
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#737373" }}>Invite</label>
            <button
              onClick={copyInviteLink}
              style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid #404040", backgroundColor: "#0f0f0f", color: "#a3a3a3", fontSize: "12px", cursor: "pointer", textAlign: "left" }}
            >
              {copied ? "Link copied ✓" : "Copy invite link"}
            </button>
          </div>

          <button
            onClick={handleStart}
            disabled={!setupPrompt.trim()}
            style={{
              backgroundColor: setupPrompt.trim() ? "#4338ca" : "#1a1a1a",
              color: setupPrompt.trim() ? "#fff" : "#525252",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: setupPrompt.trim() ? "pointer" : "not-allowed",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => { if (setupPrompt.trim()) e.currentTarget.style.backgroundColor = "#3730a3"; }}
            onMouseLeave={(e) => { if (setupPrompt.trim()) e.currentTarget.style.backgroundColor = "#4338ca"; }}
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  const remoteCursors = peers.filter((p) => p.clientId !== myIdentity.clientId && p.cursor);

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#030712", color: "#f5f5f5", overflow: "hidden" }}>
      <Sidebar
        palette={ASSET_DB}
        matchedAssets={matchedAssets}
        submittedPrompt={prompt}
        onAddAsset={handleAddAsset}
      />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          sessionName={`"${prompt}"`}
          itemCount={items.length}
          hasSelection={!!selectedId}
          selectedColor={selectedItem?.color}
          onDelete={() => { if (selectedId) { deleteItem(selectedId); setSelectedId(null); } }}
          onColorChange={handleColorChange}
          onClear={() => { clearItems(); setSelectedId(null); }}
          peers={peers}
        />
        <div
          ref={canvasWrapRef}
          onMouseMove={handleCanvasMouseMove}
          style={{ flex: 1, position: "relative", display: "flex", minHeight: 0 }}
        >
          <CanvasStage
            items={items}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={changeItem}
            onSizeChange={handleSizeChange}
          />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {remoteCursors.map((p) => (
              <div
                key={p.clientId}
                style={{
                  position: "absolute",
                  left: p.cursor!.x,
                  top: p.cursor!.y,
                  transform: "translate(-2px, -2px)",
                  transition: "left 60ms linear, top 60ms linear",
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: p.color, border: "2px solid #030712" }} />
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 6,
                    fontSize: "10px",
                    color: "#030712",
                    backgroundColor: p.color,
                    padding: "1px 6px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                    fontWeight: 600,
                  }}
                >
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
