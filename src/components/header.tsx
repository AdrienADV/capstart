import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { setDirection } from '@capgo/capacitor-transitions/react';

interface HeaderProps {
    title?: string;
    children?: React.ReactNode;
    right?: React.ReactNode;
    className?: string;
    showBack?: boolean;
}

export default function Header({ title, children, right, className, showBack = true }: HeaderProps) {
    const navigate = useNavigate();

    const goBack = () => {
        setDirection('back');
        navigate(-1);
    };

    return (
        <header
            className={cn(
                "sticky top-0 z-50 bg-background/80 backdrop-blur-md pt-(--safe-area-top) border-b",
                className
            )}
        >
            <div className="relative flex items-center justify-center px-4 h-12">
                {showBack && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4"
                        onClick={goBack}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                )}
                {title && <p className="text-md">{title}</p>}
                {children}
                {right && <div className="absolute right-4">{right}</div>}
            </div>
        </header>
    );
}
