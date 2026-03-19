import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io("https://live-caption-pro.onrender.com");

function Room() {
  const { roomId } = useParams();

  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [language, setLanguage] = useState("hi");
  const [listening, setListening] = useState(false);
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef(null);

  // 🔗 Copy link
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Meeting link copied!");
  };

  // 📋 Copy text
  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 🌍 Translate
  const translateText = async (text) => {
    if (!text) return;

    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${text}&langpair=en|${language}`
      );
      const data = await res.json();
      setTranslatedText(data.responseData.translatedText);
    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  // 🧠 Join room
  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("receive-caption", (data) => {
      const incoming = data.text || data;
      setText(incoming);
      translateText(incoming);
    });

    return () => {
      socket.off("receive-caption");
    };
  }, [roomId]);

  // 🎤 Start Listening
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListening(true);
      console.log("🎤 Listening started");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }

      setText(transcript);
      translateText(transcript);

      socket.emit("send-caption", {
        roomId,
        text: transcript,
      });
    };

    // 🔥 FIX: Always restart automatically
    recognition.onend = () => {
      console.log("Speech ended");

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    };

    // 🔥 FIX: Restart on error
    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // ⏹ Stop Listening + Save
  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // 🛑 stop auto restart
      recognitionRef.current.stop();
    }

    setListening(false);

    if (!text.trim()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const payload = JSON.parse(atob(token.split(".")[1]));

      await fetch(
        "https://live-caption-pro.onrender.com/api/transcripts/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            userId: payload.id,
          }),
        }
      );

      console.log("✅ Saved");
    } catch (error) {
      console.error(error);
    }
  };

  const clearText = () => {
    setText("");
    setTranslatedText("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 px-6 py-10">

      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            🎙 Live Caption Room
          </h1>

          <button
            onClick={copyLink}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
          >
            🔗 Copy Link
          </button>
        </div>

        {/* Language */}
        <div className="flex justify-center mb-6">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/90 text-black shadow"
          >
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        {/* Status */}
        <p className="text-center text-white/70 mb-6">
          {listening ? "Listening... 🎤 Speak now" : "Click start to begin"}
        </p>

        {/* Captions */}
        <div className="bg-black/80 text-green-400 p-6 rounded-xl mb-4 min-h-[150px] text-lg shadow-inner border border-white/10">
          {text || "Your live captions will appear here..."}
        </div>

        {/* Translation */}
        <div className="bg-white/10 text-white/90 p-4 rounded-xl mb-6 border border-white/10">
          <strong>🌍 Translated:</strong>{" "}
          {translatedText || "Translation will appear here..."}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 flex-wrap">

          {!listening ? (
            <button
              onClick={startListening}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition"
            >
              🎤 Start
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition"
            >
              ⏹ Stop
            </button>
          )}

          <button
            onClick={clearText}
            className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition"
          >
            🧹 Clear
          </button>

          <button
            onClick={copyText}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition"
          >
            📋 {copied ? "Copied!" : "Copy"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default Room;