import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";

function Dashboard() {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(null);
  const [search, setSearch] = useState("");

  // 🔥 Fetch transcripts
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
      toast.error("Failed to load transcripts ❌");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranscripts();
  }, []);

  // ❌ Delete
  const deleteTranscript = async (id) => {
    try {
      await fetch(
        `https://live-caption-pro.onrender.com/api/transcripts/${id}`,
        { method: "DELETE" }
      );

      toast.success("Deleted successfully 🗑");
      fetchTranscripts();
    } catch (error) {
      toast.error("Delete failed ❌");
    }
  };

  // 📄 PDF
  const downloadPDF = (text) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(text, 10, 10);
    doc.save("transcript.pdf");
    toast.success("PDF downloaded 📄");
  };

  // 📋 Copy
  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard 📋");
  };

  // 🧠 Generate AI Notes
  const generateSummary = async (id, text) => {
    setLoadingSummary(id);

    try {
      const res = await fetch(
        "https://live-caption-pro.onrender.com/api/ai/summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        }
      );

      const data = await res.json();

      setSummaries((prev) => ({
        ...prev,
        [id]: data,
      }));

      toast.success("AI Notes generated 🧠");
    } catch (error) {
      console.error(error);
      toast.error("AI failed ❌");
    }

    setLoadingSummary(null);
  };

  // 🔍 Filter
  const filteredTranscripts = transcripts.filter((t) =>
    t.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-10">

      <h1 className="text-4xl font-bold text-white text-center mb-10">
        📜 Transcript Dashboard
      </h1>

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-5 rounded-xl flex justify-between items-center">
          <div>
            <h2 className="text-white text-xl font-semibold">
              Welcome back 👋
            </h2>
            <p className="text-white/60 text-sm">
              Manage your transcripts & AI notes
            </p>
          </div>

          <div className="text-right">
            <p className="text-white text-2xl font-bold">
              {transcripts.length}
            </p>
            <p className="text-white/60 text-sm">
              Total Records
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Search transcripts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/10"
        />
      </div>

      <div className="max-w-4xl mx-auto grid gap-6">

        {loading ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTranscripts.length === 0 ? (
          <div className="text-center text-white/70 mt-20">
            <p className="text-5xl mb-4">🎤</p>
            <p className="text-xl">No transcripts found</p>
            <p className="text-sm mt-2">
              Try speaking or searching something else
            </p>
          </div>
        ) : (
          filteredTranscripts.map((t) => (
            <div
              key={t._id}
              className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-xl shadow-lg hover:scale-[1.02] transition"
            >

              <p className="text-white text-lg mb-4">{t.text}</p>

              <p className="text-white/60 text-sm mb-4">
                {new Date(t.createdAt).toLocaleString()}
              </p>

              <div className="flex flex-wrap gap-3 mb-3">

                <button onClick={() => deleteTranscript(t._id)} className="bg-red-500 px-4 py-2 rounded-lg text-white">
                  🗑 Delete
                </button>

                <button onClick={() => downloadPDF(t.text)} className="bg-green-500 px-4 py-2 rounded-lg text-white">
                  📄 PDF
                </button>

                <button onClick={() => copyText(t.text)} className="bg-yellow-500 px-4 py-2 rounded-lg text-white">
                  📋 Copy
                </button>

                <button
                  onClick={() => generateSummary(t._id, t.text)}
                  disabled={loadingSummary === t._id}
                  className="bg-indigo-500 px-4 py-2 rounded-lg text-white"
                >
                  {loadingSummary === t._id ? "Generating..." : "🧠 AI Notes"}
                </button>

              </div>

              {loadingSummary === t._id && (
                <p className="text-yellow-300 text-sm">
                  Generating AI notes...
                </p>
              )}

              {summaries[t._id] && (
                <div className="mt-4 text-white bg-white/10 p-4 rounded-lg">

                  <strong>🧠 Summary:</strong>
                  <p>{summaries[t._id].summary}</p>

                  <strong className="mt-2 block">📌 Key Points:</strong>
                  <ul className="list-disc ml-5">
                    {summaries[t._id].points?.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>

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