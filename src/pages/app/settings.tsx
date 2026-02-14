import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="pt-(--safe-area-top) p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-muted-foreground max-w-xl">
        This is a placeholder settings screen. Keep it if your app needs
        preferences; otherwise remove it from `tab-layout.tsx`.
      </p>

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <p className="text-sm font-medium">Suggested first real settings</p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>Language</li>
          <li>Notifications</li>
          <li>Privacy and data controls</li>
        </ul>
      </div>

      <Button onClick={() => navigate("/login")}>Back to login</Button>
    </div>
  );
}
