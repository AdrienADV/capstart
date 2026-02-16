import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { setDirection } from "@capgo/transitions/react";

interface HeaderProps {
    title?: string;
    children?: React.ReactNode;
    className?: string;
}

export default function Header({ title, children, className }: HeaderProps) {
    const navigate = useNavigate();

    return (
        <header
            className={cn(
                "sticky top-0 z-50 bg-background/80 backdrop-blur-md pt-(--safe-area-top) border-b",
                className
            )}
        >
            <div className="relative flex items-center justify-center px-4 h-12">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4"
                    onClick={() => { setDirection("back"); navigate(-1); }}
                >
                    <ChevronLeft className="size-4" />
                </Button>
                {title && <p className="text-md">{title}</p>}
                {children}
            </div>
        </header>
    );
}
