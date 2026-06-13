"use client";

import { useState } from "react";
import { Asset, filterAssets } from "@/lib/assets";
import AssetThumb from "./AssetThumb";

interface Props {
  palette: Asset[];
  submittedPrompt: string;
  isLoading: boolean;
  onGenerate: (prompt: string, assets: Asset[]) => void;
  onAddAsset: (asset: Asset) => void;
}

export default function Sidebar({
  palette,
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
    <aside className="w-60 flex-shrink-0 border-r border-neutral-800 flex flex-col bg-neutral-950">
      {/* Prompt input */}
      <div className="p-4 border-b border-neutral-800">
        <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
          Prompt
        </p>
        <textarea
          className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 focus:border-neutral-600 rounded-lg text-sm text-neutral-100 placeholder-neutral-600 p-2.5 resize-none focus:outline-none transition-colors"
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
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
          className="mt-2 w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded-lg transition-colors"
        >
          {isLoading ? "Pulling assets…" : "Generate palette"}
        </button>
      </div>

      {/* Asset palette */}
      <div className="flex-1 overflow-y-auto p-4">
        {submittedPrompt && (
          <p className="text-[10px] text-neutral-500 mb-3 leading-relaxed">
            <span className="text-neutral-400">{palette.length} assets</span>{" "}
            for &ldquo;{submittedPrompt}&rdquo;
          </p>
        )}
        {!submittedPrompt && (
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
            Default palette
          </p>
        )}
        <div className="grid grid-cols-3 gap-2">
          {palette.map((asset) => (
            <button
              key={asset.id}
              onClick={() => onAddAsset(asset)}
              title={`Add ${asset.label}`}
              className="aspect-square bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 rounded-lg p-2 flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8">
                <AssetThumb asset={asset} />
              </div>
              <span className="text-[9px] text-neutral-600 group-hover:text-neutral-400 transition-colors leading-tight text-center">
                {asset.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-neutral-800">
        <p className="text-[10px] text-neutral-700 leading-relaxed">
          Click to place · drag · resize · rotate · delete to remove
        </p>
      </div>
    </aside>
  );
}
