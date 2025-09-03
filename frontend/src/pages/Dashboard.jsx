import { useState } from "react";
import { summarizeText } from "../services/api";

export default function Dashboard() {
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState("");

  const handleSummarize = async () => {
    const data = await summarizeText(input);
    setSummary(data.summary);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Research Assistant</h1>
      <textarea
        className="w-full p-2 border rounded"
        rows={6}
        placeholder="Pega tu texto académico aquí..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleSummarize}
      >
        Resumir
      </button>
      {summary && (
        <div className="mt-6 p-3 border rounded bg-gray-50">
          <h2 className="font-semibold">Resumen:</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
