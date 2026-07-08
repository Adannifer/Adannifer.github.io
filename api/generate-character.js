import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const CHARACTER_PROMPT = `
Transform the uploaded person into a full-body pixel art game character sprite.

Preserve the person's hairstyle, outfit colors, clothing silhouette, shoes, accessories,
and overall vibe from the uploaded photo.

Style:
cute 16-bit / 32-bit pixel art fashion game sprite,
front-facing or slight 3/4 standing pose,
clean pixel edges,
limited color palette (12–24 colors),
transparent or plain light background,
readable at small size,
consistent sprite scale,
playful pink arcade starter pack aesthetic.

Output the character sprite only.
No text, no frame, no background scene, no extra people, no watermark.
Full body visible from head to feet.
`.trim();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY_MISSING",
      message:
        "API mode is not connected. Use seed avatar fallback.",
    });
  }

  try {
    const form = formidable({});
    const [, files] = await form.parse(req);
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!imageFile) {
      return res.status(400).json({ error: "IMAGE_REQUIRED" });
    }

    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: fs.createReadStream(imageFile.filepath),
      prompt: CHARACTER_PROMPT,
      size: "1024x1024",
    });

    const b64 = result.data[0].b64_json;

    return res.status(200).json({
      characterImage: `data:image/png;base64,${b64}`,
      provider: "openai",
    });
  } catch (error) {
    console.error("Character generation error:", error);
    return res.status(500).json({
      error: "CHARACTER_GENERATION_FAILED",
      message: error.message || "Unknown error",
    });
  }
}
