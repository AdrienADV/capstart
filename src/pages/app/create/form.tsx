import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { setupPage, setDirection } from '@capgo/capacitor-transitions/react';
import { Target, Sparkles } from 'lucide-react';
import Header from '@/components/header';
import type { CreateDraft } from './types';

const ACCENT = '#30d158';

const VIBES: { id: CreateDraft['vibe']; label: string; hint: string }[] = [
  { id: 'energy', label: 'Energy', hint: 'Morning boost' },
  { id: 'recovery', label: 'Recovery', hint: 'Wind down' },
  { id: 'focus', label: 'Focus', hint: 'Deep work' },
];

export default function CreateForm() {
  const pageRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [title, setTitle] = useState('Morning walk');
  const [minutes, setMinutes] = useState(30);
  const [vibe, setVibe] = useState<CreateDraft['vibe']>('energy');

  useEffect(() => {
    if (pageRef.current) return setupPage(pageRef.current);
  }, []);

  const submit = () => {
    const draft: CreateDraft = {
      title: title.trim() || 'Untitled',
      minutes,
      vibe,
    };
    setDirection('forward');
    navigate('/app/create/review', { state: draft });
  };

  return (
    <cap-page ref={pageRef}>
      <div className="flex flex-col h-full bg-background">
        <Header title="Create" />

        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-2">
          <p className="text-[13px] text-muted-foreground px-1 mb-5 leading-relaxed">
            Demo create screen — nothing is saved or synced.
          </p>

          <div
            className="bg-card rounded-[22px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:shadow-none dark:border dark:border-white/[0.08] mb-3"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="size-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${ACCENT}1a` }}>
                <Target className="size-[18px]" style={{ color: ACCENT }} />
              </div>
              <div>
                <p className="font-semibold text-[14px]">Name</p>
                <p className="text-[11px] text-muted-foreground">How you’ll see it on Home</p>
              </div>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-[15px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="e.g. Stretch break"
            />
          </div>

          <div
            className="bg-card rounded-[22px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:shadow-none dark:border dark:border-white/[0.08] mb-3"
          >
            <div className="flex justify-between items-baseline mb-3">
              <span className="font-semibold text-[14px]">Daily target</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-bold tabular-nums" style={{ color: ACCENT }}>{minutes}</span>
                <span className="text-[12px] text-muted-foreground font-medium">min</span>
              </div>
            </div>
            <input
              type="range"
              min={5}
              max={90}
              step={5}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full accent-[#30d158] h-2"
            />
            <p className="text-[11px] text-muted-foreground mt-2">Slide to fake a duration — no data is saved.</p>
          </div>

          <div
            className="bg-card rounded-[22px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:shadow-none dark:border dark:border-white/[0.08] mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="size-4 text-muted-foreground" />
              <span className="font-semibold text-[14px]">Style</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {VIBES.map(({ id, label, hint }) => {
                const on = vibe === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setVibe(id)}
                    className={`rounded-2xl px-2 py-3 text-center transition-all active:scale-[0.98] border ${on ? 'border-transparent shadow-md' : 'border-border bg-muted/30'
                      }`}
                    style={on ? { backgroundColor: `${ACCENT}18`, boxShadow: `0 4px 14px ${ACCENT}33` } : undefined}
                  >
                    <span className={`block text-[13px] font-semibold ${on ? '' : 'text-foreground'}`}
                      style={on ? { color: ACCENT } : undefined}>
                      {label}
                    </span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5 leading-tight">{hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={submit}
            className="w-full h-14 rounded-2xl font-semibold text-base text-white active:scale-[0.98] transition-transform shadow-lg"
            style={{ backgroundColor: ACCENT, boxShadow: '0 12px 28px rgba(48,209,88,0.35)' }}
          >
            Continue
          </button>
        </div>
      </div>
    </cap-page>
  );
}
