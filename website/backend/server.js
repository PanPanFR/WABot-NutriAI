import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch"; // pastikan fetch tersedia, install jika perlu: npm i node-fetch

const app = express();

app.use(cors());
app.use(bodyParser.json());

const OPENROUTER_API_KEY = "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"; // ganti sesuai kamu

// Endpoint untuk tanya AI
app.post("/askAI", async (req, res) => {
  const { question } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
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
    console.error("Error dari OpenRouter:", error);
    res.status(500).json({ reply: "Terjadi kesalahan saat menghubungi AI." });
  }
});

// ✅ Endpoint untuk cek validitas token OpenRouter
app.get("/check-token", async (req, res) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Token check failed: ${response.status} ${errText}`);
    }

    const data = await response.json();
    res.json({ valid: true, data });
  } catch (error) {
    console.error("Token check error:", error);
    res.status(401).json({ valid: false, message: "Token tidak valid atau terjadi kesalahan." });
  }
});

app.listen(9090, () => {
  console.log("Server AI berjalan di http://localhost:9090");
});
