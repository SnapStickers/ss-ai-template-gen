export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      backgroundImageUrl,
      names,
      date,
      nameSettings,
      dateSettings
    } = req.body;

    if (!backgroundImageUrl) {
      return res.status(400).json({
        error: "Missing background image"
      });
    }

    const prompt = `
You are editing an EXISTING sticker template.

DO NOT redesign the sticker.
DO NOT move floral artwork.
DO NOT change colors.
DO NOT change borders.
DO NOT change spacing.
DO NOT recreate the layout.

Use the provided image EXACTLY as the locked background template.

Only add these personalized fields:

Names:
${names}

Date:
${date}

TEXT PLACEMENT RULES:

- Place the names centered at x=${nameSettings?.x || 512}, y=${nameSettings?.y || 650}
- Place the date centered at x=${dateSettings?.x || 512}, y=${dateSettings?.y || 735}

STYLE RULES:

- Match the original typography from the sample sticker
- Match the original font style
- Match the original gold color
- Match the original alignment
- Match the original spacing
- Match the original elegance
- Keep all existing artwork untouched
- The final image should look identical to the original product image except for the replaced personalized text
`;

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: (() => {
        const formData = new FormData();

        formData.append("model", "gpt-image-1");
        formData.append("prompt", prompt);
        formData.append("image", backgroundImageUrl);

        return formData;
      })()
    });

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      return res.status(500).json({
        error: "OpenAI request failed",
        details: data
      });
    }

    const imageBase64 = data.data?.[0]?.b64_json;

    return res.status(200).json({
      success: true,
      base64Image: imageBase64
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
}
