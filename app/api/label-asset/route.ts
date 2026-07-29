import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  const { svgContent } = await request.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a design asset labeler. Given an SVG, return a JSON object with:
- "label": a short 2-3 word name for the shape (e.g. "arc sweep", "soft blob")
- "tags": array of 3-5 single-word descriptors from this set: organic, geometric, angular, bold, delicate, airy, heavy, static, directional, fragmented, looping, calm, tense
- "moods": array of 3-5 single-word moods from this set: fog, morning, memory, soft, pressure, focus, weight, night, tension, speed, cut, energy, water, depth, distance, structure

Return ONLY valid JSON, no explanation.

SVG:
${svgContent}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    const text = response.text ?? "";
    const json = text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) throw new Error("No JSON in response");

    const parsed = JSON.parse(json);
    return Response.json(parsed);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
