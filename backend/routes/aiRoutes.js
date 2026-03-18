import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/summary", async (req, res) => {
  try {
    const { text } = req.body;

    // ❌ No text
    if (!text || text.trim() === "") {
      return res.json({ summary: "No text provided" });
    }

    // ❌ No API key → fallback
    if (!process.env.OPENROUTER_API_KEY) {
      return res.json({
        summary: text.split(" ").slice(0, 20).join(" ") + "...",
      });
    }

    let summary = "";

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Summarize this clearly and professionally in one short sentence: ${text}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://bucolic-llama-bfb205.netlify.app",
            "X-Title": "Live Caption Pro",
          },
        }
      );

      // ✅ Safe extraction
      summary =
        response.data?.choices?.[0]?.message?.content || "";

    } catch (apiError) {
      console.error(
        "❌ AI API ERROR:",
        apiError.response?.data || apiError.message
      );
    }

    // 🔁 Fallback if AI fails
    if (!summary) {
      summary = text.split(" ").slice(0, 20).join(" ") + "...";
    }

    res.json({ summary });

  } catch (error) {
    console.error("🔥 FINAL ERROR:", error);

    res.json({
      summary: "Something went wrong, fallback used",
    });
  }
});

export default router;