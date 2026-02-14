import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/auth/login";
import TabLayout from "./layouts/tab-layout";
import Home from "./pages/app/home";
import Settings from "./pages/app/settings";
import Details from "./pages/app/home/details";

export default function Router() {
    return (
        <Routes>
            <Route path="login" element={<Login />} />

            <Route path="app">
                <Route element={<TabLayout />}>
                    <Route index element={<Home />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="details" element={<Details />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
