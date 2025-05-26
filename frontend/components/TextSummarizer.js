import { useState } from 'react';
import { motion } from 'framer-motion';
import mammoth from 'mammoth';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js';

GlobalWorkerOptions.workerSrc = workerSrc;

export default function TextSummarizer() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);


  const speakText = () => {
    if (!summary) return;
    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const speakWithElevenLabs = async () => {
    if (!summary) return;

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: summary,
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
          }
        }),
      });

      const audioData = await response.arrayBuffer();
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      setAudioUrl(audioUrl); // ✅ Store for download

    } catch (err) {
      console.error('ElevenLabs TTS error:', err);
      alert('❌ Failed to fetch audio from ElevenLabs.');
    }
  };

  const pauseAudio = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  };

  const resumeAudio = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();

    try {
      if (fileType === 'txt') {
        const text = await file.text();
        setInputText(text);
      } else if (fileType === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputText(result.value);
      } else if (fileType === 'pdf') {
        const pdf = await getDocument(await file.arrayBuffer()).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + '\n';
        }
        setInputText(text);
      } else {
        alert('Unsupported file type. Please upload .txt, .docx, or .pdf files.');
      }
    } catch (error) {
      console.error('File reading error:', error);
      alert('Failed to read file content.');
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setSummary('');

    try {
      const res = await fetch('http://localhost:5000/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await res.json();
      setSummary(data.summary || 'No summary returned.');
    } catch (err) {
      console.error('Fetch error:', err);
      setSummary('⚠️ Error: Could not reach the server. Showing demo content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-colors"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-800 dark:text-white">
        🎙️ AI Podcast Script Generator
      </h1>

      <input
        type="file"
        accept=".txt,.pdf,.docx"
        onChange={handleFileUpload}
        className="mb-4 block w-full text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
      />

      <textarea
        className="w-full p-4 border rounded-lg h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        placeholder="Paste your notes or content here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmit}
        disabled={loading || !inputText.trim()}
        className="mt-4 w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition disabled:opacity-50"
      >
        {loading ? 'Summarizing...' : 'Generate Podcast Script'}
      </motion.button>

      {summary && (
        <motion.div
          className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">
            📝 Generated Script
          </h2>
          <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-100">
            {summary}
          </p>

          <button
            onClick={speakText}
            className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
          >
            🔊 Play (Browser Voice)
          </button>

          <button
            onClick={speakWithElevenLabs}
            className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
          >
            🧠 Play with ElevenLabs
      </button>

{audioUrl && (
  <a
    href={audioUrl}
    download="podcast-summary.mp3"
    className="mt-2 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
  >
    💾 Download MP3
  </a>
)}
  
          <div className="mt-2 flex gap-2">
            <button
              onClick={pauseAudio}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition"
            >
              ⏸️ Pause
            </button>
            <button
              onClick={resumeAudio}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            >
              ▶️ Resume
            </button>
            <button
              onClick={stopAudio}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
            >
              ⏹️ Stop
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
