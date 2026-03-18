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

    // ❌ Too short
    if (text.split(" ").length < 6) {
      return res.json({
        summary: "Text too short to summarize",
      });
    }

    let summary = "";

    // 🔥 Try AI
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
Summarize this text in ONE short sentence (max 10 words).
Do NOT copy the same sentence.
Use different words and make it meaningful.

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
              "HTTP-Referer": "https://bucolic-llama-bfb205.netlify.app",
              "X-Title": "Live Caption Pro",
            },
          }
        );

        summary =
          response.data?.choices?.[0]?.message?.content?.trim() || "";

      } catch (apiError) {
        console.error(
          "❌ AI API ERROR:",
          apiError.response?.data || apiError.message
        );
      }
    }

    // 🔥 FIX: prevent same text output
    if (
      summary &&
      summary.toLowerCase().includes(text.slice(0, 25).toLowerCase())
    ) {
      summary = "";
    }

    // 🔁 FINAL FALLBACK (always works)
    if (!summary) {
      const words = text.split(" ");

      summary =
        "User is talking about " +
        words.slice(0, 6).join(" ") +
        "...";
    }

    res.json({ summary });

  } catch (error) {
    console.error("🔥 FINAL ERROR:", error);

    res.json({
      summary: "Summary unavailable",
    });
  }
});

export default router;