"use client";

import { Asset } from "@/lib/assets";
import AssetThumb from "./AssetThumb";

interface Props {
  palette: Asset[];
  matchedAssets: Asset[];
  submittedPrompt: string;
  onAddAsset: (asset: Asset) => void;
}

export default function Sidebar({
  palette,
  matchedAssets,
  submittedPrompt,
  onAddAsset,
}: Props) {

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
      {/* Asset palette */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#737373", marginBottom: "12px" }}>
          Shapes
        </p>
        <AssetGrid assets={palette} onAddAsset={onAddAsset} />

        {/* Matched remote assets */}
        {submittedPrompt && matchedAssets.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#737373", marginBottom: "12px" }}>
              Matched · &ldquo;{submittedPrompt}&rdquo;
            </p>
            <AssetGrid assets={matchedAssets} onAddAsset={onAddAsset} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #404040" }}>
        <p style={{ fontSize: "10px", color: "#585858", lineHeight: 1.5 }}>
          Click to place · drag · resize · rotate · delete to remove
        </p>
      </div>
    </aside>
  );
}

function AssetGrid({ assets, onAddAsset }: { assets: Asset[]; onAddAsset: (a: Asset) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
      {assets.map((asset) => (
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
          <span style={{ fontSize: "9px", color: "#737373", lineHeight: 1.2, textAlign: "center" }}>
            {asset.label}
          </span>
        </button>
      ))}
    </div>
  );
}
