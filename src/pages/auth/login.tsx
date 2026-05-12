import { useRef, useEffect, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { setupPage, setDirection } from '@capgo/capacitor-transitions/react';
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLElement>(null);
  const [email, setEmail] = useState("villermois.adrien@gmail.com");
  const [password, setPassword] = useState("123456789");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pageRef.current) {
      return setupPage(pageRef.current);
    }
  }, []);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setDirection('forward');
    navigate("/app", { replace: true });
  }

  return (
    <cap-page ref={pageRef}>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex-1 flex flex-col justify-center px-6">
          <div className="mb-10 space-y-1 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">CapStart</h1>
            <p className="text-base text-gray-400">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-14 rounded-2xl border-gray-200 bg-gray-50 px-4 text-base focus-visible:ring-red-500"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-14 rounded-2xl border-gray-200 bg-gray-50 px-4 text-base focus-visible:ring-red-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-red-500 text-white font-semibold text-base active:scale-[0.98] transition-transform disabled:opacity-60 shadow-lg shadow-red-200"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </cap-page>
  );
}
