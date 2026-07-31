"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { HexColorPicker } from "react-colorful";
import { Asset, ASSET_DB, fetchRemoteAssets, filterAssets } from "@/lib/assets";
import { CanvasItem } from "@/components/KonvaAsset";
import AssetThumb from "@/components/AssetThumb";
import { AiPlacement } from "@/app/api/ai-place/route";

const CanvasStage = dynamic(() => import("@/components/CanvasStage"), { ssr: false });

type Phase = "prompt" | "placing" | "done";

const DURATION_OPTIONS = [
  { label: "30s", seconds: 30 },
  { label: "60s", seconds: 60 },
  { label: "2 min", seconds: 120 },
  { label: "3 min", seconds: 180 },
];
const DEFAULT_DURATION = 60;
const AI_STAGGER_MS = 500;

export default function GamePage() {
  const [phase, setPhase] = useState<Phase>("prompt");
  const [prompt, setPrompt] = useState("");
  const [palette, setPalette] = useState<Asset[]>([]);
  const [remoteAssets, setRemoteAssets] = useState<Asset[]>([]);
  const [gameDuration, setGameDuration] = useState(DEFAULT_DURATION);

  const [userItems, setUserItems] = useState<CanvasItem[]>([]);
  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);
  const [aiItems, setAiItems] = useState<CanvasItem[]>([]);

  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "placing" | "done">("idle");
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const userCounter = useRef(0);
  const aiCounter = useRef(0);
  const stageSize = useRef({ width: 600, height: 500 });

  const handleUserSizeChange = useCallback((w: number, h: number) => {
    stageSize.current = { width: w, height: h };
  }, []);

  useEffect(() => {
    fetchRemoteAssets().then(setRemoteAssets);
  }, []);

  const noop = useCallback(() => {}, []);

  // Timer
  useEffect(() => {
    if (phase !== "placing") return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setPhase("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Keyboard delete for user canvas
  useEffect(() => {
    if (phase !== "placing") return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Delete" || e.key === "Backspace") && userSelectedId) {
        setUserItems((prev) => prev.filter((i) => i.instanceId !== userSelectedId));
        setUserSelectedId(null);
      }
      if (e.key === "Escape") setUserSelectedId(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, userSelectedId]);

  const startGame = async () => {
    if (!prompt.trim()) return;
    const matched = filterAssets(prompt, remoteAssets).filter((a) => a.render.type === "svg");
    const assets = [...ASSET_DB, ...matched];
    setPalette(assets);
    setUserItems([]);
    setAiItems([]);
    setUserSelectedId(null);
    setTimeLeft(gameDuration);
    setAiStatus("thinking");
    setPhase("placing");

    // Kick off AI placement
    try {
      const res = await fetch("/api/ai-place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, assets }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const placements: AiPlacement[] = data.placements;
      setAiStatus("placing");

      placements.forEach((p, i) => {
        setTimeout(() => {
          const asset = assets.find((a) => a.id === p.assetId);
          if (!asset) return;
          aiCounter.current += 1;
          setAiItems((prev) => [
            ...prev,
            {
              ...asset,
              instanceId: `ai-${p.assetId}-${aiCounter.current}`,
              x: Math.max(0, Math.min(p.x, 560)),
              y: Math.max(0, Math.min(p.y, 460)),
              scaleX: Math.max(0.5, Math.min(p.scaleX, 2.5)),
              scaleY: Math.max(0.5, Math.min(p.scaleY, 2.5)),
              rotation: p.rotation,
            },
          ]);
          if (i === placements.length - 1) setAiStatus("done");
        }, i * AI_STAGGER_MS);
      });
    } catch {
      setAiStatus("done");
    }
  };

  const addUserAsset = (asset: Asset) => {
    if (phase !== "placing") return;
    userCounter.current += 1;
    const { width, height } = stageSize.current;
    setUserItems((prev) => [
      ...prev,
      {
        ...asset,
        instanceId: `user-${asset.id}-${userCounter.current}`,
        x: 60 + Math.random() * Math.max(width - 160, 100),
        y: 60 + Math.random() * Math.max(height - 160, 100),
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    ]);
  };

  const handleUserChange = useCallback((instanceId: string, updates: Partial<CanvasItem>) => {
    setUserItems((prev) =>
      prev.map((item) => (item.instanceId === instanceId ? { ...item, ...updates } : item))
    );
  }, []);

  const handleColorChange = (color: string) => {
    if (!userSelectedId) return;
    handleUserChange(userSelectedId, { color });
  };

  useEffect(() => {
    if (!userSelectedId) setPickerOpen(false);
  }, [userSelectedId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedItem = userItems.find((i) => i.instanceId === userSelectedId);
  const selectedColor = selectedItem?.color ?? (() => {
    if (!selectedItem) return undefined;
    const r = selectedItem.render;
    if (r.type === "svg") return "#ffffff";
    if (r.type === "line" || r.type === "cross") return r.stroke;
    if (r.type === "circle" || r.type === "path") return (r.fill && r.fill !== "transparent") ? r.fill : (r.stroke ?? "#888888");
    if (r.type === "rect" || r.type === "dots") return r.fill;
    return "#888888";
  })();

  const timerColor = timeLeft <= 10 ? "#f87171" : timeLeft <= 20 ? "#fb923c" : "#a3a3a3";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#030712", color: "#f5f5f5" }}>
      {/* Topbar */}
      <div
        style={{
          height: 48,
          borderBottom: "1px solid #404040",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: "16px",
          flexShrink: 0,
        }}
      >
        <Link href="/" style={{ color: "#525252", fontSize: "12px", textDecoration: "none" }}>
          ← Home
        </Link>
        <span style={{ color: "#404040" }}>|</span>
        <span style={{ fontSize: "12px", color: "#737373" }}>Game Mode</span>

        {phase === "placing" && (
          <>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: "13px", color: "#525252", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              &ldquo;{prompt}&rdquo;
            </span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: "22px", fontWeight: 700, color: timerColor, fontVariantNumeric: "tabular-nums", minWidth: 40, textAlign: "right" }}>
              {timeLeft}s
            </span>
          </>
        )}

        {phase === "done" && (
          <>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: "13px", color: "#22c55e" }}>Time&rsquo;s up — compare below</span>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => { setPhase("prompt"); setPrompt(""); }}
              style={{ fontSize: "11px", color: "#737373", background: "none", border: "1px solid #404040", borderRadius: "5px", padding: "4px 10px", cursor: "pointer" }}
            >
              Play again
            </button>
          </>
        )}
      </div>

      {/* Prompt screen */}
      {phase === "prompt" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
          <p style={{ fontSize: "13px", color: "#737373", margin: 0 }}>Enter a prompt to start</p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              autoFocus
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") startGame(); }}
              placeholder="morning fog, tension, energy…"
              style={{
                width: 320,
                backgroundColor: "#1a1a1a",
                border: "1px solid #404040",
                borderRadius: "6px",
                color: "#f5f5f5",
                fontSize: "14px",
                padding: "10px 14px",
                outline: "none",
              }}
            />
            <button
              onClick={startGame}
              disabled={!prompt.trim()}
              style={{
                backgroundColor: prompt.trim() ? "#4338ca" : "#1a1a1a",
                color: prompt.trim() ? "#fff" : "#525252",
                border: "none",
                borderRadius: "6px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: prompt.trim() ? "pointer" : "not-allowed",
              }}
            >
              Start
            </button>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setGameDuration(opt.seconds)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: `1px solid ${gameDuration === opt.seconds ? "#6366f1" : "#404040"}`,
                  backgroundColor: gameDuration === opt.seconds ? "#1a1a2e" : "#0f0f0f",
                  color: gameDuration === opt.seconds ? "#818cf8" : "#737373",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: "11px", color: "#404040", margin: 0 }}>same assets · you vs AI</p>
        </div>
      )}

      {/* Game layout */}
      {(phase === "placing" || phase === "done") && (
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          {/* Palette sidebar */}
          <div
            style={{
              width: 200,
              flexShrink: 0,
              borderRight: "1px solid #404040",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#030712",
            }}
          >
            <div style={{ padding: "12px", borderBottom: "1px solid #404040" }}>
              <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#737373", margin: 0 }}>
                Assets
              </p>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                {palette.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => addUserAsset(asset)}
                    disabled={phase !== "placing"}
                    title={asset.label}
                    style={{
                      aspectRatio: "1",
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #404040",
                      borderRadius: "5px",
                      padding: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: phase === "placing" ? "pointer" : "default",
                      opacity: phase === "placing" ? 1 : 0.5,
                    }}
                    onMouseEnter={(e) => { if (phase === "placing") e.currentTarget.style.borderColor = "#505050"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#404040"; }}
                  >
                    <div style={{ width: 28, height: 28 }}>
                      <AssetThumb asset={asset} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {phase === "placing" && (
              <div style={{ padding: "10px 12px", borderTop: "1px solid #404040" }}>
                <p style={{ fontSize: "9px", color: "#404040", margin: 0, lineHeight: 1.5 }}>
                  Click to place · drag · delete to remove
                </p>
              </div>
            )}
          </div>

          {/* Canvases */}
          <div style={{ flex: 1, display: "flex", minWidth: 0 }}>
            {/* User canvas */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, borderRight: "1px solid #404040" }}>
              <div style={{ padding: "8px 14px", borderBottom: "1px solid #282828", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#737373" }}>You</span>
                <span style={{ fontSize: "10px", color: "#404040" }}>{userItems.length} placed</span>
                {userSelectedId && phase === "placing" && (
                  <div ref={pickerRef} style={{ position: "relative", marginLeft: "auto" }}>
                    <div
                      title="Change color"
                      onClick={() => setPickerOpen((o) => !o)}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        backgroundColor: selectedColor ?? "#888",
                        border: "2px solid #404040",
                        cursor: "pointer",
                      }}
                    />
                    {pickerOpen && (
                      <div style={{ position: "absolute", top: 26, right: 0, zIndex: 100 }}>
                        <HexColorPicker color={selectedColor ?? "#888888"} onChange={handleColorChange} />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <CanvasStage
                items={userItems}
                selectedId={phase === "placing" ? userSelectedId : null}
                onSelect={phase === "placing" ? setUserSelectedId : noop}
                onChange={handleUserChange}
                onSizeChange={handleUserSizeChange}
                readOnly={phase === "done"}
              />
            </div>

            {/* AI canvas */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              <div style={{ padding: "8px 14px", borderBottom: "1px solid #282828", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#818cf8" }}>AI</span>
                <span style={{ fontSize: "10px", color: "#404040" }}>
                  {aiStatus === "thinking" ? "thinking…" : aiStatus === "placing" ? `${aiItems.length} placed` : `${aiItems.length} placed`}
                </span>
              </div>
              <CanvasStage
                items={aiItems}
                selectedId={null}
                onSelect={noop}
                onChange={noop}
                onSizeChange={noop}
                readOnly
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
