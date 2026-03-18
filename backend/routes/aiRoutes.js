import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/summary", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.json({ summary: "No text provided" });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Summarize this in one short sentence: ${text}`,
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

    // ✅ SAFE ACCESS (NO CRASH)
    const summary =
      response.data?.choices?.[0]?.message?.content ||
      "No summary generated";

    res.json({ summary });

  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);

    // ✅ FALLBACK (VERY IMPORTANT)
    res.json({
      summary: "AI failed, showing fallback summary",
    });
  }
});

export default router;