import { useRef, useEffect } from "react";
import { setupPage, setDirection } from '@capgo/capacitor-transitions/react';
import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { supabase } from "@/lib/supabase";

export default function Settings() {
  const pageRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (pageRef.current) return setupPage(pageRef.current);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDirection('back');
    navigate('/login', { replace: true });
  };

  return (
    <cap-page ref={pageRef}>
      <cap-content>
        <div className="pt-(--safe-area-top) bg-background px-5">

          <div className="pt-6 pb-4">
            <p className="text-[12px] text-muted-foreground">Preferences</p>
            <h1 className="text-[28px] font-bold tracking-tight leading-tight mt-0.5">Settings</h1>
          </div>

          <button
            onClick={handleLogout}
            className="w-full h-14 rounded-2xl bg-red-500 text-white font-semibold text-base active:scale-[0.98] transition-transform shadow-lg shadow-red-200"
          >
            <span className="flex items-center justify-center gap-2">
              <LogOut className="size-4" />
              Sign out
            </span>
          </button>

        </div>
      </cap-content>
    </cap-page>
  );
}
