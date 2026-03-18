import axios from "axios";

export const generateSummary = async (req, res) => {
  try {
    const { text } = req.body;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Summarize this in one short sentence: ${text}`,
              },
            ],
          },
        ],
      }
    );

    const summary =
      response.data.candidates[0].content.parts[0].text;

    res.json({ summary });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "AI summary failed" });
  }
};