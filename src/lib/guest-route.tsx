import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/contexts/auth-context";

export default function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
