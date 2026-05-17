export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const {
      referenceImageUrl,
      instructions,
      fields
    } = req.body;

    // Basic validation
    if (!referenceImageUrl) {
      return res.status(400).json({
        error: 'Missing reference image URL'
      });
    }

    // Build customer text block
    const customerText = Object.entries(fields || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    // Final AI prompt
    const finalPrompt = `
Use the provided sticker image as the main reference.

${instructions}

Customer personalization:
${customerText}

Keep the same sticker shape, border, style, colors, composition, and wedding aesthetic.
Only change the personalized text and requested details.
Return a clean square printable sticker design on a transparent or plain background.
`;

    // OpenAI request
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: finalPrompt,
        size: '1024x1024'
      })
    });

    const data = await response.json();

    // Return response
    return res.status(200).json({
      success: true,
      prompt: finalPrompt,
      openai: data
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Something went wrong',
      details: error.message
    });
  }
}
