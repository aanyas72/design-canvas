import { GoogleGenAI } from "@google/genai";
import { Asset } from "@/lib/assets";

export interface AiPlacement {
  assetId: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

const CANVAS_W = 600;
const CANVAS_H = 500;

export async function POST(request: Request) {
  const { prompt, assets }: { prompt: string; assets: Asset[] } = await request.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const assetList = assets
    .map((a) => `- id: "${a.id}", label: "${a.label}", tags: [${a.tags.join(", ")}], moods: [${a.moods.join(", ")}]`)
    .join("\n");

  const systemPrompt = `You are a skilled visual designer competing in a design challenge. Your compositions are judged on how deliberate and balanced they look — not just whether the right shapes are present.

Prompt: "${prompt}"

Available assets:
${assetList}

Canvas size: ${CANVAS_W}x${CANVAS_H}

Design a composition in three passes:

1. Pick a focal point. Choose 1–2 "anchor" assets that carry the most visual weight (larger scale, ~1.5–2.5) and place them off-center following the rule of thirds — near (${Math.round(CANVAS_W / 3)}, ${Math.round(CANVAS_H / 3)}) or (${Math.round((CANVAS_W * 2) / 3)}, ${Math.round((CANVAS_H * 2) / 3)}) rather than dead-center or the edges.
2. Add 3–5 "supporting" assets at medium scale (~0.9–1.4) that relate to the anchor — echo its rotation or curve direction, or trail off from it — to build a visual flow rather than scattered noise. Leave clear negative space; don't let supporting pieces crowd the anchor or each other. Two assets may touch or slightly overlap to show depth, but avoid stacking more than two on top of each other.
3. Add 1–3 small "accent" assets at low scale (~0.5–0.9) in the empty corners or margins to balance the composition's weight — if the anchor sits upper-left, an accent in the lower-right keeps the canvas from feeling lopsided.

List placements in back-to-front paint order (background elements first, focal elements last) since later entries render on top.

Pick assets whose tags/moods genuinely match the prompt's mood — do not include an asset just to hit a count.

Return ONLY a JSON array of placements, 6–9 total. Each placement has:
- "assetId": the asset id string
- "x": number (0–${CANVAS_W})
- "y": number (0–${CANVAS_H})
- "scaleX": number (0.5–2.5)
- "scaleY": number (0.5–2.5)
- "rotation": number (degrees, -180 to 180)

Return ONLY valid JSON array, no explanation.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: systemPrompt,
    });

    const text = response.text ?? "";
    const json = text.match(/\[[\s\S]*\]/)?.[0];
    if (!json) throw new Error("No JSON array in response");

    const placements: AiPlacement[] = JSON.parse(json);
    return Response.json({ placements });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
