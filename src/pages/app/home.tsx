import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { setDirection } from '@capgo/transitions/react';

export default function Home() {
  const navigate = useNavigate();

  const goToDetails = () => {
    setDirection('forward');
    navigate("/app/details");
  };

  return (
    <div className="pt-(--safe-area-top) p-6 space-y-5">
      <p className="text-sm text-muted-foreground">CapStart Boilerplate</p>
      <h1 className="text-3xl font-semibold tracking-tight">Welcome</h1>
      <p className="text-sm text-muted-foreground">
        change "home.tsx" to change this screen
      </p>

      <Button className="w-full" onClick={goToDetails}>
        Go to details
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
