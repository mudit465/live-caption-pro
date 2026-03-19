import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/summary", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.json({ summary: "No text provided", points: [] });
    }

    let summary = "";
    let points = [];

    // 🔥 AI TRY
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "mistralai/mistral-7b-instruct",
            messages: [
              {
                role: "user",
                content: `
Analyze this text and return:

1. One short summary (max 10 words)
2. 3 key bullet points

Return in JSON format:
{
  "summary": "...",
  "points": ["...", "...", "..."]
}

Text:
${text}
`,
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const content =
          response.data?.choices?.[0]?.message?.content || "";

        try {
          const parsed = JSON.parse(content);
          summary = parsed.summary;
          points = parsed.points;
        } catch {
          summary = "";
        }

      } catch (err) {
        console.log("AI ERROR", err.message);
      }
    }

    // 🔁 FALLBACK
    if (!summary) {
      const words = text.split(" ");
      summary = "Discussion about " + words.slice(0, 6).join(" ");

      points = [
        "User shared personal thoughts",
        "Conversation about topic",
        "General discussion captured",
      ];
    }

    res.json({ summary, points });

  } catch (error) {
    res.json({
      summary: "Error generating summary",
      points: [],
    });
  }
});

export default router;