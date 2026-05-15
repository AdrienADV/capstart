import { useRef, useEffect, type ElementType, type ReactNode } from "react";
import { setupPage, setDirection } from '@capgo/capacitor-transitions/react';
import { useNavigate } from 'react-router';
import { Sun, Moon, Monitor, Bell, Lock, User, Info, LogOut, ChevronRight } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/components/theme-provider";

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeOption; icon: ElementType; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'Auto' },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider px-5 mb-2">
        {title}
      </p>
      <div className="mx-4 bg-card rounded-[22px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:shadow-none dark:border dark:border-white/[0.08] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  description,
  onClick,
  destructive,
  showChevron = true,
  right,
  separator = true,
}: {
  icon: ElementType;
  label: string;
  description?: string;
  onClick?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  right?: ReactNode;
  separator?: boolean;
}) {
  return (
    <div>
      <button
        onClick={onClick}
        disabled={!onClick}
        className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-muted/50 transition-colors disabled:opacity-100"
      >
        <div
          className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
            destructive ? 'bg-red-500/10' : 'bg-muted'
          }`}
        >
          <Icon className={`size-[18px] ${destructive ? 'text-red-500' : 'text-foreground'}`} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className={`text-[15px] font-medium leading-tight ${destructive ? 'text-red-500' : ''}`}>
            {label}
          </p>
          {description && (
            <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{description}</p>
          )}
        </div>
        {right}
        {showChevron && onClick && (
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {separator && <div className="h-px bg-border ml-[64px]" />}
    </div>
  );
}

export default function Settings() {
  const pageRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (pageRef.current) return setupPage(pageRef.current);
  }, []);

  const goTo = (path: string) => {
    setDirection('forward');
    navigate(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDirection('back');
    navigate('/login', { replace: true });
  };

  const email = user?.email ?? '';
  const initials = email.charAt(0).toUpperCase();

  return (
    <cap-page ref={pageRef}>
      <cap-content>
        <div className="pt-(--safe-area-top) bg-background min-h-full pb-28">

          {/* Header */}
          <div className="px-5 pt-6 pb-5">
            <p className="text-[12px] text-muted-foreground">Application</p>
            <h1 className="text-[28px] font-bold tracking-tight leading-tight mt-0.5">Settings</h1>
          </div>

          {/* Account card */}
          <div className="mx-4 mb-6 bg-card rounded-[22px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:shadow-none dark:border dark:border-white/[0.08] p-4 flex items-center gap-4">
            <div className="size-14 rounded-full bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/30 shrink-0">
              <span className="text-white font-bold text-[22px]">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[16px] leading-tight truncate">
                {user?.user_metadata?.full_name ?? 'My Account'}
              </p>
              <p className="text-[13px] text-muted-foreground mt-0.5 truncate">{email}</p>
            </div>
            <button
              onClick={() => goTo('/app/profile')}
              className="text-[13px] text-primary font-medium shrink-0 active:opacity-60 transition-opacity"
            >
              Edit
            </button>
          </div>

          {/* Appearance */}
          <Section title="Appearance">
            <div className="px-4 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Sun className="size-4 text-muted-foreground" />
                <p className="text-[15px] font-medium">Theme</p>
              </div>
              <div className="flex gap-2">
                {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                      theme === value
                        ? 'border-primary bg-primary/8 text-primary'
                        : 'border-border bg-muted/40 text-muted-foreground active:bg-muted'
                    }`}
                  >
                    <Icon className="size-5" />
                    <span className="text-[12px] font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Preferences */}
          <Section title="Preferences">
            <Row
              icon={Bell}
              label="Notifications"
              description="Manage alerts & reminders"
              onClick={() => goTo('/app/notifications')}
            />
            <Row
              icon={Lock}
              label="Privacy & Security"
              description="Data & permissions"
              onClick={() => goTo('/app/profile')}
              separator={false}
            />
          </Section>

          {/* About */}
          <Section title="About">
            <Row
              icon={User}
              label="Profile"
              description="View your health profile"
              onClick={() => goTo('/app/profile')}
            />
            <Row
              icon={Info}
              label="Version"
              description="1.0.0"
              showChevron={false}
              separator={false}
            />
          </Section>

          {/* Sign out */}
          <div className="mx-4">
            <div className="bg-card rounded-[22px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:shadow-none dark:border dark:border-white/[0.08] overflow-hidden">
              <Row
                icon={LogOut}
                label="Sign Out"
                onClick={handleLogout}
                destructive
                showChevron={false}
                separator={false}
              />
            </div>
          </div>

        </div>
      </cap-content>
    </cap-page>
  );
}
