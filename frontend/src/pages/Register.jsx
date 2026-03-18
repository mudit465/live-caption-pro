import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {

      const res = await fetch("https://live-caption-pro.onrender.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password
        }),
      });

      const data = await res.json();

      alert(data.message);

      // 🔥 REDIRECT AFTER REGISTER
      window.location.href = "/login";

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">

      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-lg w-96"
      >

        <h2 className="text-2xl font-bold mb-6">Register</h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full mb-4 p-2 border"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-blue-500 text-white px-4 py-2 w-full">
          Register
        </button>

      </form>

    </div>
  );
}

export default Register;