"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Asset, ASSET_DB, fetchRemoteAssets, filterAssets } from "@/lib/assets";
import { CanvasItem } from "./KonvaAsset";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const CanvasStage = dynamic(() => import("./CanvasStage"), { ssr: false });

type Phase = "setup" | "playing" | "done";

const TIMER_OPTIONS = [
  { label: "1 min", seconds: 60 },
  { label: "3 min", seconds: 180 },
  { label: "5 min", seconds: 300 },
  { label: "No limit", seconds: null },
];

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
  "tense silence before motion",
  "layered depth and focus",
];

export default function CanvasPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [setupPrompt, setSetupPrompt] = useState("");
  const [timerSeconds, setTimerSeconds] = useState<number | null>(60);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const [remoteAssets, setRemoteAssets] = useState<Asset[]>([]);
  const [matchedAssets, setMatchedAssets] = useState<Asset[]>([]);
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const idCounter = useRef(0);

  const selectedItem = items.find((i) => i.instanceId === selectedId);

  useEffect(() => {
    fetchRemoteAssets().then(setRemoteAssets);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (phase !== "playing" || timeLeft === null) return;
    if (timeLeft <= 0) { setPhase("done"); return; }
    const t = setTimeout(() => setTimeLeft((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  // Keyboard shortcuts
  useEffect(() => {
    if (phase !== "playing") return;
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
  }, [phase, selectedId]);

  const handleStart = () => {
    if (!setupPrompt.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setMatchedAssets(filterAssets(setupPrompt, remoteAssets).filter((a) => a.render.type === "svg"));
      setSubmittedPrompt(setupPrompt);
      setItems([]);
      setSelectedId(null);
      setIsLoading(false);
      setTimeLeft(timerSeconds);
      setPhase("playing");
    }, 400);
  };

  const handleGenerate = (prompt: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setMatchedAssets(filterAssets(prompt, remoteAssets).filter((a) => a.render.type === "svg"));
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
          item.instanceId === instanceId ? { ...item, ...updates } : item,
        ),
      );
    },
    [],
  );

  const handleDelete = () => {
    if (!selectedId) return;
    setItems((prev) => prev.filter((i) => i.instanceId !== selectedId));
    setSelectedId(null);
  };

  const handleColorChange = (color: string) => {
    if (!selectedId) return;
    handleChange(selectedId, { color });
  };

  const handleSizeChange = useCallback((w: number, h: number) => {
    setStageSize({ width: w, height: h });
  }, []);

  const generateRandomPrompt = () => {
    const idx = Math.floor(Math.random() * GENERATED_PROMPTS.length);
    setSetupPrompt(GENERATED_PROMPTS[idx]);
  };

  const resetToSetup = () => {
    setPhase("setup");
    setSetupPrompt(submittedPrompt);
    setItems([]);
    setSelectedId(null);
    setTimeLeft(null);
  };

  if (phase === "setup") {
    return (
      <div style={{ display: "flex", height: "100vh", backgroundColor: "#030712", color: "#f5f5f5", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 420, display: "flex", flexDirection: "column", gap: "28px" }}>
          <div>
            <a href="/" style={{ fontSize: "12px", color: "#525252", textDecoration: "none", display: "inline-block", marginBottom: "12px" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#a3a3a3"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#525252"; }}
            >← Home</a>
            <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 4px", letterSpacing: "-0.01em" }}>Timed Canvas</h2>
            <p style={{ fontSize: "13px", color: "#525252", margin: 0 }}>Set your prompt and timer before starting</p>
          </div>

          {/* Prompt */}
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
              style={{
                alignSelf: "flex-start",
                fontSize: "11px",
                color: "#6366f1",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#818cf8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#6366f1"; }}
            >
              ↺ Generate prompt
            </button>
          </div>

          {/* Timer */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#737373" }}>Timer</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {TIMER_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setTimerSeconds(opt.seconds)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: "6px",
                    border: `1px solid ${timerSeconds === opt.seconds ? "#6366f1" : "#404040"}`,
                    backgroundColor: timerSeconds === opt.seconds ? "#1a1a2e" : "#0f0f0f",
                    color: timerSeconds === opt.seconds ? "#818cf8" : "#737373",
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Invite */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#737373" }}>Invite</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                disabled
                placeholder="Enter email address"
                style={{
                  flex: 1,
                  backgroundColor: "#0a0a0a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "6px",
                  color: "#525252",
                  fontSize: "13px",
                  padding: "8px 12px",
                  outline: "none",
                  cursor: "not-allowed",
                }}
              />
              <button
                disabled
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid #2a2a2a",
                  backgroundColor: "#0a0a0a",
                  color: "#404040",
                  fontSize: "12px",
                  cursor: "not-allowed",
                }}
              >
                Invite
              </button>
            </div>
            <p style={{ fontSize: "10px", color: "#404040", margin: 0 }}>Coming soon</p>
          </div>

          {/* Start */}
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

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#030712", color: "#f5f5f5", overflow: "hidden" }}>
      <Sidebar
        palette={ASSET_DB}
        matchedAssets={matchedAssets}
        submittedPrompt={submittedPrompt}
        onAddAsset={phase === "playing" ? handleAddAsset : () => {}}
      />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          sessionName={submittedPrompt ? `"${submittedPrompt}"` : "Untitled session"}
          itemCount={items.length}
          hasSelection={!!selectedId && phase === "playing"}
          selectedColor={selectedItem?.color ?? (selectedItem ? getDefaultColor(selectedItem) : undefined)}
          onDelete={handleDelete}
          onColorChange={handleColorChange}
          onClear={() => { setItems([]); setSelectedId(null); }}
          timeLeft={timeLeft}
          phase={phase}
          onRestart={resetToSetup}
        />
        <CanvasStage
          items={items}
          selectedId={phase === "playing" ? selectedId : null}
          onSelect={phase === "playing" ? setSelectedId : () => {}}
          onChange={handleChange}
          onSizeChange={handleSizeChange}
          readOnly={phase === "done"}
        />
      </main>
    </div>
  );
}

function getDefaultColor(item: CanvasItem): string {
  const r = item.render;
  if (r.type === "svg") return "#ffffff";
  if (r.type === "line" || r.type === "cross") return r.stroke;
  if (r.type === "circle" || r.type === "path") {
    const hasFill = r.fill && r.fill !== "transparent";
    return hasFill ? r.fill! : (r.stroke ?? "#888888");
  }
  if (r.type === "rect" || r.type === "dots") return r.fill;
  return "#888888";
}
