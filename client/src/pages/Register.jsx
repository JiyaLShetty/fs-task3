import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import api from "../api/axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/signup", { username, email, password });
      const res = await api.post("/auth/login", { email, password });
      login(res.data.accessToken, res.data.user);
      toast.success("Account created. Welcome to Hookshot!");
      navigate("/overview");
    } catch (err) {
      if (err.response?.status === 429) {
        const wait = err.response.headers["retry-after"];
        toast.error(
          wait
            ? `Too many attempts. Try again in ${wait}s.`
            : "Too many attempts. Try again shortly."
        );
      } else {
        toast.error(err.response?.data?.error || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full px-4 py-3.5 rounded-lg bg-field text-neutral-900 placeholder-neutral-500 text-sm outline-none border border-fieldline focus:border-pink-600 transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-app p-6 relative">
      <ThemeToggle className="absolute top-4 right-4" />

      <div className="w-full max-w-275 grid grid-cols-1 md:grid-cols-[1.1fr_1fr] bg-panel rounded-3xl overflow-hidden border border-line">
        <div className="hidden md:block relative min-h-140 bg-inset bg-[radial-gradient(circle_at_30%_60%,#7c3aed55,transparent_60%),radial-gradient(circle_at_60%_30%,#db277655,transparent_55%)]" />

        <div className="p-10 md:p-14 flex flex-col justify-center">
          <h1 className="text-3xl md:text-[2.1rem] font-bold text-fg tracking-tight mb-2">
            Create your account
          </h1>
          <p className="text-sm text-muted mb-7">
            Already have an account?{" "}
            <Link to="/login" className="text-fg underline underline-offset-4">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3.5">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={fieldClass}
              />
            </div>

            <div className="mb-3.5">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={fieldClass}
              />
            </div>

            <div className="mb-3.5">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`${fieldClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg text-grad-text font-semibold text-sm bg-linear-to-r from-grad-from to-grad-to hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity mt-2"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
