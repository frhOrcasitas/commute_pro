"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      // Supabase returns "Invalid login credentials" for wrong email/password
      setError(error.message);
      return;
    }

    router.push("/dashboard");
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">

      {/* Nav */}
      <nav className="flex items-center px-5 sm:px-8 py-4 bg-[#30638E] shadow-md">
        <Link href="/" className="text-white text-xl font-bold tracking-tight">
          CommutePro
        </Link>
      </nav>

      {/* Card */}
      <section className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden">

          {/* Card top accent */}
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(to right, #30638E, #00798C)" }} />

          <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">

            {/* Heading */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-sm text-zinc-500">Sign in to your CommutePro account</p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-[#D1495B]/10 border border-[#D1495B]/30 text-[#D1495B] text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Fields */}
            <div className="space-y-4">
              <AuthField
                label="Email"
                type="email"
                placeholder="user123@youremail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <AuthField
                label="Password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition disabled:opacity-60"
              style={{ backgroundColor: "#30638E" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#00798C"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#30638E"}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>

            {/* Footer link */}
            <p className="text-center text-sm text-zinc-500">
              Don't have an account?{" "}
              <Link href="/register" className="font-semibold text-[#30638E] hover:text-[#00798C] transition">
                Register here
              </Link>
            </p>

          </div>
        </div>
      </section>
    </div>
  );
}

function AuthField({ label, type, placeholder, value, onChange, onKeyDown }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#30638E] transition placeholder:text-zinc-400"
      />
    </div>
  );
}