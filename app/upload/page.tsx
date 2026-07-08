"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface AssetDraft {
  file: File;
  objectUrl: string;
  svgContent: string;
  label: string;
  tags: string;
  moods: string;
  status: "idle" | "labeling" | "uploading" | "done" | "error";
  error?: string;
}

export default function UploadPage() {
  const [drafts, setDrafts] = useState<AssetDraft[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const svgFiles = Array.from(files).filter((f) => f.type === "image/svg+xml" || f.name.endsWith(".svg"));
    svgFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgContent = e.target?.result as string;
        setDrafts((prev) => [
          ...prev,
          {
            file,
            objectUrl: URL.createObjectURL(file),
            svgContent,
            label: file.name.replace(/\.svg$/i, "").replace(/[-_]/g, " "),
            tags: "",
            moods: "",
            status: "idle",
          },
        ]);
      };
      reader.readAsText(file);
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const updateDraft = (index: number, patch: Partial<AssetDraft>) => {
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  const autoLabel = async (index: number) => {
    const draft = drafts[index];
    updateDraft(index, { status: "labeling", error: undefined });
    try {
      const res = await fetch("/api/label-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ svgContent: draft.svgContent }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      updateDraft(index, {
        label: data.label ?? draft.label,
        tags: (data.tags ?? []).join(", "),
        moods: (data.moods ?? []).join(", "),
        status: "idle",
      });
    } catch (err) {
      updateDraft(index, { status: "error", error: String(err) });
    }
  };

  const save = async (index: number) => {
    const draft = drafts[index];
    if (!draft.label.trim()) return;
    updateDraft(index, { status: "uploading", error: undefined });
    try {
      const fileName = `${crypto.randomUUID()}.svg`;
      const { error: uploadError } = await supabase.storage
        .from("asset-svgs")
        .upload(fileName, draft.file, { contentType: "image/svg+xml" });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("asset-svgs").getPublicUrl(fileName);

      const tags = draft.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const moods = draft.moods.split(",").map((m) => m.trim()).filter(Boolean);

      const { error: insertError } = await supabase.from("assets").insert({
        label: draft.label.trim(),
        tags,
        moods,
        svg_url: urlData.publicUrl,
      });
      if (insertError) throw insertError;

      updateDraft(index, { status: "done" });
    } catch (err) {
      updateDraft(index, { status: "error", error: String(err) });
    }
  };

  const remove = (index: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#030712", color: "#f5f5f5", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #404040", padding: "14px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href="/" style={{ color: "#737373", fontSize: "13px", textDecoration: "none" }}>
          ← Canvas
        </Link>
        <span style={{ color: "#404040" }}>|</span>
        <span style={{ fontSize: "13px", color: "#a3a3a3" }}>Asset Library</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          style={{
            border: "2px dashed #404040",
            borderRadius: "10px",
            padding: "48px",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: "32px",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#404040")}
        >
          <p style={{ fontSize: "14px", color: "#737373", margin: 0 }}>
            Drop SVG files here or <span style={{ color: "#6366f1" }}>browse</span>
          </p>
          <p style={{ fontSize: "11px", color: "#525252", marginTop: "6px" }}>SVG only</p>
          <input
            ref={inputRef}
            type="file"
            accept=".svg,image/svg+xml"
            multiple
            style={{ display: "none" }}
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {/* Drafts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {drafts.map((draft, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#0f0f0f",
                border: `1px solid ${draft.status === "done" ? "#22c55e44" : "#404040"}`,
                borderRadius: "10px",
                padding: "16px",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
              }}
            >
              {/* Preview */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  flexShrink: 0,
                  backgroundColor: "#1a1a1a",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                }}
              >
                <img src={draft.objectUrl} alt={draft.label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>

              {/* Fields */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                <Field
                  label="Label"
                  value={draft.label}
                  onChange={(v) => updateDraft(i, { label: v })}
                  disabled={draft.status === "done"}
                />
                <Field
                  label="Tags"
                  value={draft.tags}
                  onChange={(v) => updateDraft(i, { tags: v })}
                  placeholder="comma separated, e.g. organic, calm, airy"
                  disabled={draft.status === "done"}
                />
                <Field
                  label="Moods"
                  value={draft.moods}
                  onChange={(v) => updateDraft(i, { moods: v })}
                  placeholder="comma separated, e.g. fog, morning, soft"
                  disabled={draft.status === "done"}
                />
                {draft.error && (
                  <p style={{ fontSize: "11px", color: "#f87171", margin: 0 }}>{draft.error}</p>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                {draft.status === "done" ? (
                  <span style={{ fontSize: "11px", color: "#22c55e" }}>Saved</span>
                ) : (
                  <>
                    <Btn
                      onClick={() => autoLabel(i)}
                      disabled={draft.status === "labeling" || draft.status === "uploading"}
                      muted
                    >
                      {draft.status === "labeling" ? "Labeling…" : "Auto-label"}
                    </Btn>
                    <Btn
                      onClick={() => save(i)}
                      disabled={!draft.label.trim() || draft.status === "labeling" || draft.status === "uploading"}
                    >
                      {draft.status === "uploading" ? "Saving…" : "Save"}
                    </Btn>
                  </>
                )}
                <Btn onClick={() => remove(i)} muted danger>
                  Remove
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "10px", color: "#737373", width: 40, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          flex: 1,
          backgroundColor: "#1a1a1a",
          border: "1px solid #404040",
          borderRadius: "4px",
          color: "#f5f5f5",
          fontSize: "12px",
          padding: "5px 8px",
          outline: "none",
        }}
      />
    </div>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  muted,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  muted?: boolean;
  danger?: boolean;
}) {
  const bg = danger ? "#7f1d1d" : muted ? "#262626" : "#4338ca";
  const bgHover = danger ? "#991b1b" : muted ? "#303030" : "#3730a3";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? "#1a1a1a" : bg,
        color: disabled ? "#525252" : "#f5f5f5",
        border: "1px solid #404040",
        borderRadius: "5px",
        fontSize: "11px",
        padding: "5px 10px",
        cursor: disabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = bgHover; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = bg; }}
    >
      {children}
    </button>
  );
}
