import { summarizeText } from '../services/summarizer.mjs';

export async function summarizeDocument(req, res) {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text input' });
    }

    const summary = await summarizeText(text);
    res.json({ summary });
  } catch (error) {
    console.error('Summarization failed:', error);
    res.status(500).json({ error: 'Failed to summarize text' });
  }
}



