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
You are editing a personalized printable sticker template.

REFERENCE IMAGE:
Use this product image URL as the visual reference:
${referenceImageUrl}

CORE GOAL:
Create a new personalized version of the same sticker design.
Do not invent a brand new design.
Do not reinterpret the style.
Do not change the visual identity unless the customer specifically asks for it.

TEMPLATE INSTRUCTIONS:
${templateInstructions}

PRESERVE RULES:
${preserveRules}

GENERATION INSTRUCTIONS:
${generationInstructions}

CUSTOMER PERSONALIZATION:
Names: ${fields.names || ""}
Date: ${fields.date || ""}
Message: ${fields.message || ""}
Color/style notes: ${fields.color || ""}

STRICT OUTPUT RULES:
- Preserve the same overall composition as the reference image.
- Preserve the same circular sticker shape.
- Preserve the same background color and texture.
- Preserve the same border placement and gold accent style.
- Preserve the same floral placement and visual balance.
- Preserve the same typography hierarchy and font style as closely as possible.
- Replace only the personalized text fields.
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
