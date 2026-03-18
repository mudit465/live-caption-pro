import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";

function Dashboard() {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(null);

  // Fetch transcripts
  const fetchTranscripts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const payload = JSON.parse(atob(token.split(".")[1]));

      const res = await fetch(
        `https://live-caption-pro.onrender.com/api/transcripts?userId=${payload.id}`
      );

      const data = await res.json();

      setTranscripts(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranscripts();
  }, []);

  // Delete
  const deleteTranscript = async (id) => {
    await fetch(`https://live-caption-pro.onrender.com/api/transcripts/${id}`, {
      method: "DELETE",
    });
    fetchTranscripts();
  };

  // PDF
  const downloadPDF = (text) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(text, 10, 10);
    doc.save("transcript.pdf");
  };

  // Generate summary
  const generateSummary = async (id, text) => {
    setLoadingSummary(id);

    try {
      const res = await fetch("https://live-caption-pro.onrender.com/api/ai/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      setSummaries((prev) => ({
        ...prev,
        [id]: data.summary,
      }));
    } catch (error) {
      console.error(error);
    }

    setLoadingSummary(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-10">

      <h1 className="text-4xl font-bold text-white text-center mb-10">
        📜 Transcript Dashboard
      </h1>

      <div className="max-w-4xl mx-auto grid gap-6">

        {loading ? (
          <p className="text-white text-center">
            Loading transcripts...
          </p>
        ) : transcripts.length === 0 ? (
          <div className="text-center text-white/70">
            <p className="text-xl">No transcripts yet 😴</p>
            <p className="text-sm mt-2">
              Go to a room and start speaking 🎤
            </p>
          </div>
        ) : (
          transcripts.map((t) => (
            <div
              key={t._id}
              className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-xl shadow-lg"
            >

              <p className="text-white text-lg mb-4">
                {t.text}
              </p>

              <p className="text-white/60 text-sm mb-4">
                {new Date(t.createdAt).toLocaleString()}
              </p>

              <div className="flex flex-wrap gap-3 mb-3">

                <button
                  onClick={() => deleteTranscript(t._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Delete
                </button>

                <button
                  onClick={() => downloadPDF(t.text)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Download PDF
                </button>

                <button
                  onClick={() => generateSummary(t._id, t.text)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
                >
                  {loadingSummary === t._id ? "Loading..." : "Generate Summary"}
                </button>

              </div>

              {summaries[t._id] && (
                <div className="mt-3 text-white bg-white/10 p-3 rounded-lg">
                  <strong>🧠 AI Summary:</strong> {summaries[t._id]}
                </div>
              )}

            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default Dashboard;