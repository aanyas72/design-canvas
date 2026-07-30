import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
  }
  if (!prompt || !String(prompt).trim()) {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const instruction = `You are a minimal design asset generator. Given a short description, output a single simple SVG icon/shape.

Rules:
- viewBox="0 0 80 80" (or similar small square/rect dimensions matching this design system's assets)
- Use plain shapes: path, circle, rect, line, or polyline
- No gradients, no filters, no text, no raster images
- Use a single flat color, "#000", for every shape's fill or stroke — the app recolors this automatically at render time, so the exact color doesn't matter, but it must be explicit
- Every shape must be EITHER filled (fill="#000", stroke="none" or omitted) OR stroked (fill="none" stroke="#000" stroke-width="..."), never left with no fill/stroke at all — an unstyled shape defaults to black and won't recolor correctly
- Do not mix filled and stroked shapes with different intents in confusing ways; keep each shape's paint style unambiguous
- Keep it minimal and abstract, not a literal illustration
- Return ONLY the raw <svg>...</svg> markup, no markdown fences, no explanation

Description: ${prompt}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: instruction,
    });

    const text = response.text ?? "";
    const svg = text.match(/<svg[\s\S]*<\/svg>/i)?.[0];
    if (!svg) throw new Error("No SVG in response");

    return Response.json({ svg });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
