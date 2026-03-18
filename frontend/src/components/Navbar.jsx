import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <h1 className="text-2xl font-bold text-white">
          🎙 Live Caption Pro
        </h1>

        {/* Links */}
        <div className="flex items-center gap-6 text-white/80 font-medium">

          {token && (
            <>
              <Link to="/" className="hover:text-white transition">
                Home
              </Link>

              <Link to="/dashboard" className="hover:text-white transition">
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </>
          )}

          {!token && (
            <>
              <Link to="/login" className="hover:text-white transition">
                Login
              </Link>

              <Link to="/register" className="hover:text-white transition">
                Register
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;