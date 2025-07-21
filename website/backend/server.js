import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔒 HARD-CODED API KEY (kamu bisa ganti langsung di sini)
const OPENROUTER_API_KEY = "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";

// Endpoint utama untuk tanya AI
app.post("/askai", async (req, res) => {
  const { question } = req.body;

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ reply: "API key belum diatur." });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [{ role: "user", content: question }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Maaf, tidak bisa menjawab.";
    res.json({ reply });
  } catch (error) {
    console.error("❌ Error saat menghubungi OpenRouter:", error.message);
    res.status(500).json({ reply: "Terjadi kesalahan saat menghubungi AI." });
  }
});

// Port default
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server AI aktif di port ${PORT}`);
});
