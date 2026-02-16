import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/auth/login";
import ProtectedRoute from "./lib/protected-route";
import GuestRoute from "./lib/guest-route";
import TabLayout from "./layouts/tab-layout";
import Home from "./pages/app/home";
import Settings from "./pages/app/settings";
import Details from "./pages/app/home/details";
import { initTransitions, setupRouterOutlet } from '@capgo/transitions/react';
import '@capgo/transitions';
import { useEffect, useRef } from 'react';

initTransitions({ platform: 'auto' });

export default function Router() {
    const outletRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (outletRef.current) {
            setupRouterOutlet(outletRef.current, { platform: "auto" });
        }
    }, []);

    return (
        <cap-router-outlet ref={outletRef}>
            <Routes>
                <Route element={<GuestRoute />}>
                    <Route path="login" element={<Login />} />
                </Route>

                <Route path="app" element={<ProtectedRoute />}>
                    <Route element={<TabLayout />}>
                        <Route index element={<Home />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                    <Route path="details" element={<Details />} />
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </cap-router-outlet>
    );
}
