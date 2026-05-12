import type { Location } from 'react-router';
import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/auth/login";
import ProtectedRoute from "./lib/protected-route";
import GuestRoute from "./lib/guest-route";
import TabLayout from "./layouts/tab-layout";
import Home from "./pages/app/home";
import Settings from "./pages/app/settings";
import Details from "./pages/app/home/details";
import Profile from "./pages/app/profile";
import Notifications from "./pages/app/notifications";
import CreateLayout from "./pages/app/create/layout";
import CreateForm from "./pages/app/create/form";
import CreateReview from "./pages/app/create/review";

interface RouterProps {
    location: Location;
}

export default function Router({ location }: RouterProps) {
    return (
        <Routes location={location}>
            <Route element={<GuestRoute />}>
                <Route path="login" element={<Login />} />
            </Route>

            <Route path="app" element={<ProtectedRoute />}>
                <Route element={<TabLayout />}>
                    <Route index element={<Home />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="details" element={<Details />} />
                <Route path="profile" element={<Profile />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="create" element={<CreateLayout />}>
                    <Route index element={<CreateForm />} />
                    <Route path="review" element={<CreateReview />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
