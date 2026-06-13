export type AssetRender =
  | { type: "path"; d: string; fill?: string; stroke?: string; strokeWidth?: number; width: number; height: number }
  | { type: "circle"; radius: number; fill?: string; stroke?: string; strokeWidth?: number; width: number; height: number }
  | { type: "line"; points: number[]; stroke: string; strokeWidth: number; width: number; height: number }
  | { type: "rect"; width: number; height: number; fill: string; rx?: number }
  | { type: "dots"; positions: [number, number][]; radius: number; fill: string; width: number; height: number }
  | { type: "cross"; stroke: string; strokeWidth: number; width: number; height: number };

export interface Asset {
  id: string;
  label: string;
  tags: string[];
  moods: string[];
  render: AssetRender;
}

export const ASSET_DB: Asset[] = [
  {
    id: "a1", label: "arc sweep",
    tags: ["organic", "calm", "airy", "looping"],
    moods: ["fog", "morning", "memory", "soft"],
    render: { type: "path", d: "M0,60 Q40,-20 80,60", stroke: "#6366f1", strokeWidth: 3, fill: "transparent", width: 80, height: 70 },
  },
  {
    id: "a2", label: "dense circle",
    tags: ["geometric", "heavy", "static", "bold"],
    moods: ["pressure", "focus", "weight", "night"],
    render: { type: "circle", radius: 36, fill: "#f97316", width: 80, height: 80 },
  },
  {
    id: "a3", label: "thin shard",
    tags: ["angular", "tense", "directional", "fragmented"],
    moods: ["tension", "speed", "cut", "morning"],
    render: { type: "path", d: "M40,0 L80,70 L0,70 Z", fill: "#10b981", width: 80, height: 75 },
  },
  {
    id: "a4", label: "open ring",
    tags: ["geometric", "airy", "looping", "delicate"],
    moods: ["memory", "fog", "soft", "distance"],
    render: { type: "circle", radius: 34, fill: "transparent", stroke: "#8b5cf6", strokeWidth: 2.5, width: 80, height: 80 },
  },
  {
    id: "a5", label: "slash line",
    tags: ["angular", "directional", "bold", "fragmented"],
    moods: ["tension", "speed", "cut", "energy"],
    render: { type: "line", points: [0, 70, 60, 0], stroke: "#f43f5e", strokeWidth: 3, width: 65, height: 75 },
  },
  {
    id: "a6", label: "soft blob",
    tags: ["organic", "calm", "heavy", "looping"],
    moods: ["morning", "fog", "soft", "weight"],
    render: { type: "path", d: "M40,5 C70,5 75,30 75,40 C75,60 60,75 40,75 C20,75 5,60 5,40 C5,20 10,5 40,5 Z", fill: "#fbbf24", width: 80, height: 80 },
  },
  {
    id: "a7", label: "grid dots",
    tags: ["geometric", "static", "delicate", "airy"],
    moods: ["distance", "memory", "structure", "morning"],
    render: { type: "dots", positions: [[10,10],[30,10],[10,30],[30,30],[20,20]], radius: 4, fill: "#06b6d4", width: 45, height: 45 },
  },
  {
    id: "a8", label: "wave band",
    tags: ["organic", "directional", "calm", "airy"],
    moods: ["water", "fog", "morning", "soft"],
    render: { type: "path", d: "M0,30 Q20,10 40,30 Q60,50 80,30", stroke: "#84cc16", strokeWidth: 3, fill: "transparent", width: 80, height: 60 },
  },
  {
    id: "a9", label: "long rect",
    tags: ["geometric", "static", "bold", "heavy"],
    moods: ["structure", "weight", "night", "pressure"],
    render: { type: "rect", width: 80, height: 18, fill: "#475569", rx: 2 },
  },
  {
    id: "a10", label: "half moon",
    tags: ["organic", "calm", "airy", "delicate"],
    moods: ["night", "memory", "soft", "distance"],
    render: { type: "path", d: "M40,5 A35,35 0 0 1 40,75 Z", fill: "#a78bfa", width: 80, height: 80 },
  },
  {
    id: "a11", label: "zigzag",
    tags: ["angular", "tense", "directional", "fragmented"],
    moods: ["energy", "tension", "speed", "cut"],
    render: { type: "line", points: [0,50, 20,10, 40,50, 60,10, 80,50], stroke: "#fb923c", strokeWidth: 2.5, width: 85, height: 60 },
  },
  {
    id: "a12", label: "cross mark",
    tags: ["geometric", "tense", "static", "bold"],
    moods: ["structure", "pressure", "focus", "night"],
    render: { type: "cross", stroke: "#64748b", strokeWidth: 2.5, width: 50, height: 50 },
  },
  {
    id: "a13", label: "spiral arc",
    tags: ["organic", "looping", "calm", "directional"],
    moods: ["memory", "depth", "water", "soft"],
    render: { type: "path", d: "M40,40 Q60,10 40,20 Q20,30 30,50 Q40,70 60,55", stroke: "#e879f9", strokeWidth: 2.5, fill: "transparent", width: 80, height: 80 },
  },
  {
    id: "a14", label: "wedge",
    tags: ["angular", "bold", "directional", "heavy"],
    moods: ["pressure", "cut", "energy", "focus"],
    render: { type: "path", d: "M0,60 L80,60 L40,0 Z", fill: "#0ea5e9", width: 80, height: 65 },
  },
  {
    id: "a15", label: "dash cluster",
    tags: ["fragmented", "airy", "delicate", "static"],
    moods: ["distance", "morning", "fog", "structure"],
    render: { type: "dots", positions: [[5,20],[25,5],[45,25],[15,40],[35,45],[55,10]], radius: 3, fill: "#f472b6", width: 65, height: 55 },
  },
  {
    id: "a16", label: "bent bar",
    tags: ["angular", "directional", "geometric", "bold"],
    moods: ["tension", "structure", "speed", "night"],
    render: { type: "line", points: [0,60, 40,60, 70,10], stroke: "#34d399", strokeWidth: 3, width: 75, height: 70 },
  },
];

export function filterAssets(prompt: string): Asset[] {
  if (!prompt.trim()) return ASSET_DB.slice(0, 12);

  const words = prompt.toLowerCase().split(/\s+/);

  const scored = ASSET_DB.map((asset) => {
    let score = 0;
    words.forEach((w) => {
      asset.tags.forEach((t) => { if (t.includes(w) || w.includes(t)) score += 2; });
      asset.moods.forEach((m) => { if (m.includes(w) || w.includes(m)) score += 3; });
      if (asset.label.includes(w)) score += 1;
    });
    return { ...asset, score };
  });

  const sorted = scored.sort((a, b) => b.score - a.score);
  const top = sorted.filter((a) => a.score > 0).slice(0, 12);
  return top.length >= 6 ? top : ASSET_DB.slice(0, 12);
}
