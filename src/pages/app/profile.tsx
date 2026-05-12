import { useRef, useEffect } from 'react';
import { replace, useNavigate } from 'react-router';
import { setupPage, setDirection } from '@capgo/capacitor-transitions/react';
import { Heart, Footprints, Flame, Moon, Bell, Lock, LogOut, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/header';

const C = {
  steps: '#30d158',
  calories: '#ff9f0a',
  sleep: '#bf5af2',
  heart: '#ff3b30',
};

const STATS = [
  { icon: Heart, value: '72', unit: 'BPM', label: 'Avg Heart Rate', color: C.heart },
  { icon: Footprints, value: '8,234', unit: 'steps', label: 'Today', color: C.steps },
  { icon: Flame, value: '423', unit: 'kcal', label: 'Burned', color: C.calories },
  { icon: Moon, value: '7h32', unit: '', label: 'Sleep', color: C.sleep },
];

const MENU = [
  { icon: Bell, label: 'Notifications', path: '/app/notifications' },
  { icon: Lock, label: 'Privacy & Security', path: null },
];

export default function Profile() {
  const pageRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (pageRef.current) return setupPage(pageRef.current);
  }, []);

  const goTo = (path: string | null) => {
    if (!path) return;
    setDirection('forward');
    navigate(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDirection('back');
    navigate('/login', { replace: true });
  };

  return (
    <cap-page ref={pageRef}>
      <div className="flex flex-col h-full bg-background">
        <Header title="Profile" />
        <div className="flex-1 overflow-y-auto pb-10">

          {/* Avatar + name */}
          <div className="flex flex-col items-center gap-2 mt-6 mb-6">
            <div className="size-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-[32px]">A</span>
            </div>
            <p className="font-bold text-[22px] tracking-tight">Adrien</p>
            <p className="text-[13px] text-muted-foreground">Member since 2024</p>
          </div>

          {/* Stats grid */}
          <div className="mx-4 grid grid-cols-2 gap-3 mb-4">
            {STATS.map(({ icon: Icon, value, unit, label, color }) => (
              <div key={label}
                className="bg-card rounded-[22px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:shadow-none dark:border dark:border-white/[0.08]"
              >
                <div className="size-9 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${color}1a` }}>
                  <Icon className="size-[18px]" style={{ color }} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[20px] font-bold leading-none tracking-tight">{value}</span>
                  {unit && <span className="text-[11px] text-muted-foreground">{unit}</span>}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Menu */}
          <div className="mx-4 bg-card rounded-[22px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:shadow-none dark:border dark:border-white/[0.08] overflow-hidden mb-4">
            {MENU.map(({ icon: Icon, label, path }, i) => (
              <div key={label}>
                {i > 0 && <div className="h-px bg-border mx-4" />}
                <button onClick={() => goTo(path)} className="w-full flex items-center gap-3 px-4 py-4 active:bg-muted/50 transition-colors">
                  <Icon className="size-5 text-muted-foreground" />
                  <span className="text-[15px] font-medium flex-1 text-left">{label}</span>
                  <ChevronLeft className="size-4 text-muted-foreground rotate-180" />
                </button>
              </div>
            ))}
          </div>

          {/* Logout */}
          <div className="mx-4">
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

        </div>
      </div>
    </cap-page>
  );
}
