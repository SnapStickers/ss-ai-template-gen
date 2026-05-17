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
    const { referenceImageUrl, instructions, fields = {} } = req.body;

    const prompt = `
Create a personalized wedding circle sticker.

Use this product image URL as the visual reference:
${referenceImageUrl}

Instructions:
${instructions}

Customer text:
Names: ${fields.names || ""}
Date: ${fields.date || ""}
Message: ${fields.message || ""}
Color/style notes: ${fields.color || ""}

Keep the same elegant wedding sticker style, circular layout, blush florals, gold accents, centered composition, and premium printable sticker look.
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
      openai: data
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
