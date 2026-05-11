import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { setDirection } from '@capgo/capacitor-transitions/react';
import { useAuth } from "@/contexts/auth-context";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      setDirection('none');
      navigate('/login', { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return null;
  }

  return <Outlet />;
}
