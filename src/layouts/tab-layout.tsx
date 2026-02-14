import { NavLink, Outlet } from "react-router";
import { Home, Settings } from "lucide-react";

const tabs = [
    { to: "/app", icon: Home, label: "Home" },
    { to: "/app/settings", icon: Settings, label: "Settings" },
];

export default function TabLayout() {
    return (
        <div className="flex flex-col h-screen">
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>

            <nav className="shrink-0 border-t bg-background">
                <div className="flex justify-around items-center pb-(--safe-area-bottom) pt-2">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.to}
                            to={tab.to}
                            end={tab.to === "/app"}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 text-xs transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`
                            }
                        >
                            <tab.icon className="size-5" />
                            <span>{tab.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
}
