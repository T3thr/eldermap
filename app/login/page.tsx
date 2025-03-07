// app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function AdminLogin() {
  const [loginType, setLoginType] = useState<"username" | "email">("username");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const credentials = {
        username: loginType === "username" ? username : email,
        password,
        redirect: false, // Handle redirect manually
      };

      const result = await signIn("credentials", credentials);

      if (result?.error) {
        switch (result.error) {
          case "Admin user not found":
            setError(
              `No admin found with this ${loginType === "username" ? "username" : "email"}`
            );
            break;
          case "Invalid password":
            setError("Incorrect password");
            break;
          case "Username or email and password are required":
            setError("Please enter your credentials");
            break;
          default:
            setError("Authentication failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Redirect to dashboard or another page after successful login
      window.location.href = "/admin/dashboard"; // Optional manual redirect
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-accent/5">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-primary">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to manage the Thai Provinces platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-accent/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Login with
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setLoginType("username")}
                  disabled={loading}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    loginType === "username"
                      ? "bg-primary text-foreground"
                      : "bg-card text-foreground/20 hover:bg-gray-400"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Username
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType("email")}
                  disabled={loading}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    loginType === "email"
                      ? "bg-primary text-foreground"
                      : "bg-card text-foreground/20 hover:bg-gray-400"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Email
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor={loginType}
                className="block text-sm font-medium text-foreground"
              >
                {loginType === "username" ? "Username" : "Email"}
              </label>
              <input
                id={loginType}
                name={loginType}
                type={loginType === "email" ? "email" : "text"}
                required
                value={loginType === "username" ? username : email}
                onChange={(e) =>
                  loginType === "username"
                    ? setUsername(e.target.value)
                    : setEmail(e.target.value)
                }
                disabled={loading}
                className={`block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={`block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-accent/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  New to the platform?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/admin/register"
                className={`flex w-full justify-center rounded-md bg-accent/10 px-3 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors duration-200 ${
                  loading ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Request Admin Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}