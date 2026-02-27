"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Register() {
  const router   = useRouter();
  const [userName, setUserName] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSignup = async () => {
    setError("");
    if (!email || !password || !userName) { setError("Please fill in all fields."); return; }
    if (password.length < 10) { setError("Password must be at least 10 characters."); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) { setError(error.message); setLoading(false); return; }

    if (data?.user) {
      const { error: dbError } = await supabase.from("tbl_users").insert([{
        user_id:   data.user.id,
        user_name: userName,
      }]);

      if (dbError) { setError("Account created, but profile setup failed: " + dbError.message); setLoading(false); return; }

      alert("Account created! Please check your email to confirm, then log in.");
      router.push("/login");
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSignup(); };

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
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(to right, #00798C, #EDAE49)" }} />

          <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">

            {/* Heading */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create an account</h1>
              <p className="text-sm text-zinc-500">Become a commuter pro today.</p>
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
                label="Username"
                type="text"
                placeholder="Your display name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
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
                placeholder="At least 10 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              {/* Password strength hint */}
              {password.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((password.length / 20) * 100, 100)}%`,
                        backgroundColor: password.length < 10 ? "#D1495B" : password.length < 16 ? "#EDAE49" : "#00798C",
                      }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400">
                    {password.length < 10 ? "Too short" : password.length < 16 ? "Good" : "Strong"}
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition disabled:opacity-60"
              style={{ backgroundColor: "#00798C" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#30638E"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#00798C"}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>

            {/* Footer link */}
            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#30638E] hover:text-[#00798C] transition">
                Sign in
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