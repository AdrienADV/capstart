import { useRef, useEffect, useState } from "react";
import { setupPage } from '@capgo/capacitor-transitions/react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function Settings() {
  const pageRef = useRef<HTMLElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pageRef.current) {
      return setupPage(pageRef.current);
    }
  }, []);

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  }

  return (
    <cap-page ref={pageRef}>
      <div className="pt-(--safe-area-top) p-6 space-y-5">
        <p className="text-sm text-muted-foreground">CapStart Boilerplate</p>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          change "settings.tsx" to change this screen
        </p>

        <Button className="w-full" variant="destructive" onClick={logout} disabled={loading}>
          {loading ? "Logging out…" : "Logout"}
        </Button>
      </div>
    </cap-page>
  );
}
