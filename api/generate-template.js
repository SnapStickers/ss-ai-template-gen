export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      referenceImageUrl,
      templateInstructions = "",
      preserveRules = "",
      generationInstructions = "",
      fields = {}
    } = req.body;

    const prompt = `
You are creating a personalized printable wedding sticker from a blank template image.

REFERENCE TEMPLATE IMAGE:
Use this image URL as the visual template:
${referenceImageUrl}

CORE GOAL:
Use the provided blank template as the base design.
Do not redesign the sticker.
Do not change the floral artwork, border, background, gold accents, or "Thank You" headline.
Only add the customer's names and date into the blank lower area.

TEMPLATE INSTRUCTIONS:
${templateInstructions}

PRESERVE RULES:
${preserveRules}

GENERATION INSTRUCTIONS:
${generationInstructions}

CUSTOMER PERSONALIZATION:
Names: ${fields.names || ""}
Date: ${fields.date || ""}
Color/style notes: ${fields.color || ""}

STRICT OUTPUT RULES:
- Keep the same circular sticker layout.
- Keep the same cream background.
- Keep the same blush floral artwork.
- Keep the same green leaves.
- Keep the same gold border lines and gold accents.
- Keep the "Thank You" script exactly as part of the design.
- Add the customer names in the lower center blank area.
- Add the date below the names.
- Match the elegant wedding typography style as closely as possible.
- Keep the design centered, clean, readable, premium, and print-ready.
- Output a square sticker design.
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024"
      })
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return res.status(openaiResponse.status).json({
        error: "OpenAI request failed",
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      prompt,
      openai: data
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
