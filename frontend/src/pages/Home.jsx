import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const createRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 8);
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white text-center px-6">

      {/* Main Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-10 rounded-2xl shadow-2xl max-w-xl w-full">

        {/* Title */}
        <h1 className="text-5xl font-extrabold mb-2">
          🎙 Live Caption Pro
        </h1>

        {/* Author */}
        <p className="text-sm mb-4 text-white/70">
          by Mudit 🚀
        </p>

        {/* Description */}
        <p className="text-lg mb-6 text-white/80">
          Convert your speech into real-time captions with AI-powered accuracy.
        </p>

        {/* Extra Info */}
        <p className="text-sm mb-8 text-white/60">
          Create a room and share the link with others to see captions live.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4">

          <button
            onClick={createRoom}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 transition"
          >
            🚀 Start Live Session
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-black/30 border border-white/20 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-black/40 transition"
          >
            📊 View Dashboard
          </button>

        </div>

      </div>

      {/* Footer */}
      <p className="mt-6 text-sm text-white/70">
        Built with ❤️ by <span className="font-semibold">Mudddit 🫶🏻</span>
      </p>

      <p className="text-xs text-white/50 mt-1">
        © 2026 Live Caption Pro
      </p>

    </div>
  );
}

export default Home;