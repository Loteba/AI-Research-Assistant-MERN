import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const summarizeText = async (req, res) => {
  try {
    const { text } = req.body;
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: `Resume el siguiente texto académico:\n\n${text}` }],
    });
    res.json({ summary: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
