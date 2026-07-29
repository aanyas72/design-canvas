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
- Flat fills or single stroke color, no gradients, no filters, no text, no raster images
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
