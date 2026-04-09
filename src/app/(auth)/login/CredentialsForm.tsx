"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { C } from "@/lib/colors";
import { registerAction } from "./actions";

export function CredentialsForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      rememberMe: String(rememberMe),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      window.location.href = "/dashboard";
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await registerAction({ name, email, password });
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    const res = await signIn("credentials", {
      email,
      password,
      rememberMe: String(rememberMe),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Compte créé ! Connectez-vous.");
      setMode("login");
    } else {
      window.location.href = "/dashboard";
    }
  }

  const inputStyle = {
    border: `1px solid ${C.anthracite}`,
    color: C.white,
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  } as React.CSSProperties;

  const inputClassName = "bg-white dark:bg-[var(--momento-ink)]";

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex rounded-xl p-1 gap-1 bg-white dark:bg-[var(--momento-ink)]">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(""); }}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: mode === m ? C.dark : "transparent",
              color: mode === m ? C.white : C.mist,
              border: mode === m ? `1px solid ${C.anthracite}` : "1px solid transparent",
            }}
          >
            {m === "login" ? "Connexion" : "S'inscrire"}
          </button>
        ))}
      </div>

      <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-3">
        {mode === "register" && (
          <input
            type="text"
            placeholder="Ton prénom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClassName}
            style={inputStyle}
          />
        )}
        <input
          type="email"
          placeholder="toi@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClassName}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className={inputClassName}
          style={inputStyle}
        />

        {mode === "login" && (
          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-xs hover:underline"
              style={{ color: C.mist }}
            >
              Mot de passe oublié ?
            </a>
          </div>
        )}

        {/* Remember me */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setRememberMe(!rememberMe)}
            className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              backgroundColor: rememberMe ? C.terra : "transparent",
              border: `2px solid ${rememberMe ? C.terra : C.anthracite}`,
            }}
          >
            {rememberMe && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span
            className="text-xs"
            style={{ color: C.mist }}
            onClick={() => setRememberMe(!rememberMe)}
          >
            Se souvenir de moi{rememberMe ? " (30 jours)" : " (1 jour)"}
          </span>
        </label>

        {error && <p className="text-sm" style={{ color: "#ef4444" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: C.terra }}
        >
          {loading ? "..." : mode === "login" ? "Se connecter" : "Créer un compte"}
        </button>
      </form>
    </div>
  );
}
