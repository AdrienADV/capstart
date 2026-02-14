import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="pt-(--safe-area-top) p-6 space-y-5">
      <p className="text-sm text-muted-foreground">CapStart Boilerplate</p>
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground">
        change "settings.tsx" to change this screen
      </p>

      <Button className="w-full" variant="destructive" onClick={() => navigate("/login")}>
        Back to login
      </Button>
    </div>
  );
}
