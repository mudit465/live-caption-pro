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

    // 🔥 Skip short text
    if (text.split(" ").length < 6) {
      return res.json({
        summary: "Text too short to summarize",
      });
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
          // ✅ Free working model
          model: "mistralai/mistral-7b-instruct",

          messages: [
            {
              role: "user",
              content: `
Rewrite the following text into ONE short professional sentence.

STRICT RULES:
- Do NOT copy the same sentence
- Use different words
- Make it shorter
- Maximum 12 words
- Output only the final sentence

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

      // ✅ Safe extraction
      summary =
        response.data?.choices?.[0]?.message?.content?.trim() || "";

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