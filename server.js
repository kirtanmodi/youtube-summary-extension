const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const port = 3000;

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.post("/summarize", async (req, res) => {
  console.log("Received summarize request");
  const apiKey = req.headers.authorization?.split(" ")[1];
  if (!apiKey) {
    return res.status(401).json({ error: "API key is missing" });
  }

  const openai = new OpenAI({ apiKey });

  try {
    console.log("Transcript length:", req.body.transcript.length);
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant who explains main points from a transcript in a concise manner. Use markdown. and use numbered bullet points.",
        },
        { role: "user", content: `Please summarize the following transcript:\n\n${req.body.transcript}` },
      ],
      temperature: 0.1,
      max_tokens: 250,
    });

    console.log("OpenAI API response received");
    res.json({ summary: response.choices[0].message.content });
  } catch (error) {
    console.error("Error in summarize endpoint:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred" });
  }
});

app.post("/ask", async (req, res) => {
  console.log("Received ask request");
  const apiKey = req.headers.authorization?.split(" ")[1];
  if (!apiKey) {
    return res.status(401).json({ error: "API key is missing" });
  }

  const openai = new OpenAI({ apiKey });

  try {
    console.log("Summary length:", req.body.summary.length);
    console.log("Question:", req.body.question);
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `Based on the following summary, ${req.body.summary}, ${req.body.question}` },
      ],
      temperature: 0.5,
    });

    console.log("OpenAI API response received");
    res.json({ answer: response.choices[0].message.content });
  } catch (error) {
    console.error("Error in ask endpoint:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred" });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "An unexpected error occurred" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
