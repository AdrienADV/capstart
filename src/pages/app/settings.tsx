import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function Settings() {
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  }

  return (
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
  );
}
