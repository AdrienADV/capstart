import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();

  function handleLogin() {
    navigate("/app");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold">Welcome to CapStart</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        This auth screen is intentionally fake. Replace it with your real auth
        provider.
      </p>
      <Button size="lg" onClick={handleLogin}>
        Continue to demo app
      </Button>
    </div>
  );
}
