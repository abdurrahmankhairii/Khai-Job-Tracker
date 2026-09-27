"use client";

import { useFormState, useFormStatus } from "react-dom";
import { register } from "@/actions/auth-actions";
import Link from "next/link";
import { Briefcase } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-lg py-3 px-4 transition-colors font-medium flex justify-center items-center"
      disabled={pending}
    >
      {pending ? "Creating account..." : "Sign Up"}
    </button>
  );
}

export default function RegisterPage() {
  const [errorMessage, dispatch] = useFormState(register, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-sky-100 p-3 rounded-2xl mb-4">
            <Briefcase className="w-8 h-8 text-sky-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
          <p className="text-slate-500 mt-2">Start tracking your job applications</p>
        </div>

        <form action={dispatch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white/50"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white/50"
              placeholder="john@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white/50"
              placeholder="••••••••"
            />
          </div>

          {errorMessage && (
            <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>

        <p className="text-center mt-6 text-slate-500 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-sky-500 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
