"use client";

import { useState } from "react";
import { Asset, filterAssets } from "@/lib/assets";
import AssetThumb from "./AssetThumb";

interface Props {
  palette: Asset[];
  remoteAssets: Asset[];
  submittedPrompt: string;
  isLoading: boolean;
  onGenerate: (prompt: string, assets: Asset[]) => void;
  onAddAsset: (asset: Asset) => void;
}

export default function Sidebar({
  palette,
  remoteAssets,
  submittedPrompt,
  isLoading,
  onGenerate,
  onAddAsset,
}: Props) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;
    const assets = filterAssets(prompt);
    onGenerate(prompt, assets);
  };

  return (
    <aside
      style={{
        width: 280,
        flexShrink: 0,
        borderRight: "1px solid #404040",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#030712",
      }}
    >
      {/* Prompt input */}
      <div style={{ padding: "16px", borderBottom: "1px solid #404040" }}>
        <p
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#737373",
            marginBottom: "8px",
          }}
        >
          Prompt
        </p>
        <textarea
          style={{
            width: "100%",
            backgroundColor: "#1a1a1a",
            border: "1px solid #404040",
            borderRadius: "6px",
            fontSize: "14px",
            color: "#f5f5f5",
            padding: "10px",
            resize: "none",
          }}
          rows={3}
          placeholder="morning fog, tension…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#505050";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#404040";
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
          style={{
            marginTop: "8px",
            width: "100%",
            backgroundColor:
              isLoading || !prompt.trim() ? "#4338ca99" : "#4338ca",
            color: "white",
            fontSize: "12px",
            fontWeight: 500,
            padding: "8px 0",
            borderRadius: "6px",
            border: "none",
            cursor: isLoading || !prompt.trim() ? "not-allowed" : "pointer",
            opacity: isLoading || !prompt.trim() ? 0.4 : 1,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isLoading && prompt.trim())
              e.currentTarget.style.backgroundColor = "#3730a3";
          }}
          onMouseLeave={(e) => {
            if (!isLoading && prompt.trim())
              e.currentTarget.style.backgroundColor = "#4338ca";
          }}
        >
          {isLoading ? "Pulling assets…" : "Generate palette"}
        </button>
      </div>

      {/* Asset palette */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {submittedPrompt && (
          <p
            style={{
              fontSize: "10px",
              color: "#737373",
              marginBottom: "12px",
              lineHeight: 1.5,
            }}
          >
            <span style={{ color: "#a3a3a3" }}>{palette.length} assets</span>{" "}
            for &ldquo;{submittedPrompt}&rdquo;
          </p>
        )}
        {!submittedPrompt && (
          <p
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#737373",
              marginBottom: "12px",
            }}
          >
            Default Shapes
          </p>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
          }}
        >
          {palette.map((asset) => (
            <button
              key={asset.id}
              onClick={() => onAddAsset(asset)}
              title={`Add ${asset.label}`}
              style={{
                aspectRatio: "1",
                backgroundColor: "#1a1a1a",
                border: "1px solid #404040",
                borderRadius: "6px",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#262626";
                e.currentTarget.style.borderColor = "#505050";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#1a1a1a";
                e.currentTarget.style.borderColor = "#404040";
              }}
            >
              <div style={{ width: 32, height: 32 }}>
                <AssetThumb asset={asset} />
              </div>
              <span
                style={{
                  fontSize: "9px",
                  color: "#737373",
                  transition: "color 0.2s",
                  lineHeight: 1.2,
                  textAlign: "center",
                }}
              >
                {asset.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Library — remote SVG assets */}
      {remoteAssets.length > 0 && (
        <div style={{ padding: "0 16px 16px" }}>
          <p
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#737373",
              marginBottom: "12px",
              paddingTop: "12px",
              borderTop: "1px solid #404040",
            }}
          >
            Library
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            {remoteAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => onAddAsset(asset)}
                title={`Add ${asset.label}`}
                style={{
                  aspectRatio: "1",
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #404040",
                  borderRadius: "6px",
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#262626";
                  e.currentTarget.style.borderColor = "#505050";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1a1a1a";
                  e.currentTarget.style.borderColor = "#404040";
                }}
              >
                <div style={{ width: 32, height: 32 }}>
                  <AssetThumb asset={asset} />
                </div>
                <span
                  style={{
                    fontSize: "9px",
                    color: "#737373",
                    lineHeight: 1.2,
                    textAlign: "center",
                  }}
                >
                  {asset.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #404040" }}>
        <p style={{ fontSize: "10px", color: "#585858", lineHeight: 1.5 }}>
          Click to place · drag · resize · rotate · delete to remove
        </p>
      </div>
    </aside>
  );
}
