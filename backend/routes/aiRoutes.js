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

    // 🔥 Try AI first
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
Summarize this text in ONE short professional sentence.
- Max 10 words
- Do NOT copy same sentence
- Use different wording

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

    // 🔥 Prevent same-text copy
    if (
      summary &&
      summary.toLowerCase().includes(text.slice(0, 25).toLowerCase())
    ) {
      summary = "";
    }

    // 🔁 SMART FALLBACK
    if (!summary) {
      const lowerText = text.toLowerCase();

      if (lowerText.includes("computer science")) {
        summary = "Computer science student describing background";
      } 
      else if (lowerText.includes("web development")) {
        summary = "User learning web development as a career";
      } 
      else if (lowerText.includes("project")) {
        summary = "User discussing a personal project";
      } 
      else {
        const words = text.split(" ");
        summary = "Summary: " + words.slice(0, 8).join(" ") + "...";
      }
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