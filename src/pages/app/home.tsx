import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="pt-(--safe-area-top) p-6 space-y-5">
      <p className="text-sm text-muted-foreground">CapStart Boilerplate</p>
      <h1 className="text-3xl font-semibold tracking-tight">Welcome</h1>
      <p className="text-sm text-muted-foreground">
        change "home.tsx" to change this screen
      </p>

      <Button className="w-full" onClick={() => navigate("/app/details")}>
        Go to details
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
