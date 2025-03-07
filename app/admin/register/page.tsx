"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    institution: "",
    researchBackground: "",
    contributionPlan: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Store the admin request in Firestore
      const requestRef = doc(db, "adminRequests", formData.username);
      await setDoc(requestRef, {
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        // Note: In a real app, you'd hash the password on the server
        // This is just for demo purposes
        password: formData.password, 
        institution: formData.institution,
        researchBackground: formData.researchBackground,
        contributionPlan: formData.contributionPlan,
        status: "pending",
        requestDate: new Date().toISOString(),
      });

      setSuccess(true);
      setLoading(false);
      // Reset form data
      setFormData({
        fullName: "",
        email: "",
        username: "",
        password: "",
        institution: "",
        researchBackground: "",
        contributionPlan: "",
      });
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/admin/login");
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred while submitting your request");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-accent/5">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-primary">
          Request Admin Access
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Join our platform as a contributor and help preserve Thai history
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-accent/20 glass-effect">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground">Request Submitted Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                Thank you for your interest in contributing to our platform. We'll review your application and contact you soon.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-foreground">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="institution" className="block text-sm font-medium text-foreground">
                    Institution/Organization
                  </label>
                  <input
                    type="text"
                    id="institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="researchBackground" className="block text-sm font-medium text-foreground">
                  Academic/Research Background
                </label>
                <textarea
                  id="researchBackground"
                  name="researchBackground"
                  rows={3}
                  required
                  value={formData.researchBackground}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Please share your background in history, geography, or related fields..."
                />
              </div>

              <div>
                <label htmlFor="contributionPlan" className="block text-sm font-medium text-foreground">
                  How do you plan to contribute?
                </label>
                <textarea
                  id="contributionPlan"
                  name="contributionPlan"
                  rows={3}
                  required
                  value={formData.contributionPlan}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Explain how you plan to enhance our historical database..."
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link href="/admin/login" className="font-medium text-primary hover:text-primary/80">
                    Already have an account? Sign in
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}