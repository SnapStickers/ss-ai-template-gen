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
      backgroundImageUrl,
      names,
      date,
      nameSettings = {},
      dateSettings = {}
    } = req.body;

    if (!backgroundImageUrl) {
      return res.status(400).json({ error: "Missing background image URL" });
    }

    if (!names || !date) {
      return res.status(400).json({ error: "Missing names or date" });
    }

    const escapeXml = (value) => {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    const fitFontSize = (text, settings) => {
      const baseSize = Number(settings.fontSize || 60);
      const minSize = Number(settings.minFontSize || 38);
      const maxWidth = Number(settings.maxWidth || 620);

      const estimatedWidth = text.length * baseSize * 0.58;

      if (estimatedWidth <= maxWidth) {
        return baseSize;
      }

      const reducedSize = Math.floor(baseSize * (maxWidth / estimatedWidth));

      return Math.max(reducedSize, minSize);
    };

    const nameFontSize = fitFontSize(names, nameSettings);
    const dateFontSize = fitFontSize(date, dateSettings);

    const nameX = Number(nameSettings.x || 512);
    const nameY = Number(nameSettings.y || 650);
    const dateX = Number(dateSettings.x || 512);
    const dateY = Number(dateSettings.y || 735);

    const nameColor = nameSettings.color || "#1a1a1a";
    const dateColor = dateSettings.color || "#b08a2e";

    const nameLetterSpacing = Number(nameSettings.letterSpacing || 6);
    const dateLetterSpacing = Number(dateSettings.letterSpacing || 8);

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <image href="${escapeXml(backgroundImageUrl)}" x="0" y="0" width="1024" height="1024" preserveAspectRatio="xMidYMid slice"/>

  <text
    x="${nameX}"
    y="${nameY}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="${nameFontSize}"
    letter-spacing="${nameLetterSpacing}"
    fill="${nameColor}"
  >${escapeXml(names.toUpperCase())}</text>

  <text
    x="${dateX}"
    y="${dateY}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="${dateFontSize}"
    letter-spacing="${dateLetterSpacing}"
    fill="${dateColor}"
  >${escapeXml(date)}</text>
</svg>`;

    const base64Svg = Buffer.from(svg).toString("base64");

    return res.status(200).json({
      success: true,
      imageUrl: `data:image/svg+xml;base64,${base64Svg}`
    });

  } catch (error) {
    return res.status(500).json({
      error: "Render failed",
      details: error.message
    });
  }
}
