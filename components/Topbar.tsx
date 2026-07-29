"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HexColorPicker } from "react-colorful";

interface Props {
  sessionName: string;
  itemCount: number;
  hasSelection: boolean;
  selectedColor?: string;
  onDelete: () => void;
  onClear: () => void;
  onColorChange: (color: string) => void;
  timeLeft?: number | null;
  phase?: "setup" | "playing" | "done";
  onRestart?: () => void;
}

export default function Topbar({
  sessionName,
  itemCount,
  hasSelection,
  selectedColor,
  onDelete,
  onClear,
  onColorChange,
  timeLeft,
  phase,
  onRestart,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // close picker when selection is cleared
  useEffect(() => {
    if (!hasSelection) setPickerOpen(false);
  }, [hasSelection]);

  return (
    <div
      style={{
        height: 44,
        borderBottom: "1px solid #404040",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 32,
        paddingRight: 32,
        flexShrink: 0,
        backgroundColor: "#030712",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/" style={{ fontSize: "12px", color: "#525252", textDecoration: "none" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#a3a3a3"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#525252"; }}
        >
          ← Home
        </Link>
        <span style={{ color: "#404040" }}>|</span>
        <span style={{ fontSize: "14px", fontWeight: 500, color: "#e5e5e5" }}>
          {sessionName}
        </span>
        {itemCount > 0 && (
          <span style={{ fontSize: "10px", color: "#595959" }}>
            {itemCount} element{itemCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {hasSelection && (
          <>
            <div ref={pickerRef} style={{ position: "relative" }}>
              <div
                title="Change color"
                onClick={() => setPickerOpen((o) => !o)}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: selectedColor ?? "#888",
                  border: "2px solid #404040",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              {pickerOpen && (
                <div style={{ position: "absolute", top: 28, right: 0, zIndex: 100 }}>
                  <HexColorPicker
                    color={selectedColor ?? "#888888"}
                    onChange={onColorChange}
                  />
                </div>
              )}
            </div>
            <button
              onClick={onDelete}
              style={{
                fontSize: "11px",
                color: "#808080",
                padding: "4px 8px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#808080"; }}
            >
              Delete
            </button>
          </>
        )}
        {itemCount > 0 && (
          <button
            onClick={onClear}
            style={{
              fontSize: "11px",
              color: "#737373",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#a3a3a3"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#737373"; }}
          >
            Clear all
          </button>
        )}
        {phase === "done" && (
          <button
            onClick={onRestart}
            style={{
              fontSize: "11px",
              color: "#737373",
              padding: "4px 10px",
              borderRadius: "4px",
              border: "1px solid #404040",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#a3a3a3"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#737373"; }}
          >
            New session
          </button>
        )}
        {phase === "done" && (
          <span style={{ fontSize: "12px", color: "#22c55e" }}>Time&rsquo;s up</span>
        )}
        {timeLeft !== null && timeLeft !== undefined && phase === "playing" && (
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: timeLeft <= 10 ? "#f87171" : timeLeft <= 30 ? "#fb923c" : "#a3a3a3",
              fontVariantNumeric: "tabular-nums",
              minWidth: 48,
              textAlign: "right",
            }}
          >
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </span>
        )}
      </div>
    </div>
  );
}