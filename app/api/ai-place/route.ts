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

  const systemPrompt = `You are a creative AI design agent competing in a design challenge.

Prompt: "${prompt}"

Available assets:
${assetList}

Canvas size: ${CANVAS_W}x${CANVAS_H}

Select 6–10 assets from the list and place them on the canvas to create a composition that evokes the prompt. Think about balance, contrast, and mood.

Return ONLY a JSON array of placements. Each placement has:
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
