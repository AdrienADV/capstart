import { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { setupPage, setDirection } from '@capgo/capacitor-transitions/react';
import { Check } from 'lucide-react';
import Header from '@/components/header';
import type { CreateDraft } from './types';

const ACCENT = '#30d158';

function vibeLabel(v: CreateDraft['vibe']) {
  if (v === 'energy') return 'Energy';
  if (v === 'recovery') return 'Recovery';
  return 'Focus';
}

export default function CreateReview() {
  const pageRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const draft = location.state as CreateDraft | undefined;

  useEffect(() => {
    if (pageRef.current) return setupPage(pageRef.current);
  }, []);

  useEffect(() => {
    if (!draft?.title) {
      setDirection('back');
      navigate('/app/create', { replace: true });
    }
  }, [draft, navigate]);

  const finish = () => {
    setDirection('root');
    navigate('/app', { replace: true });
  };

  if (!draft?.title) return null;

  return (
    <cap-page ref={pageRef}>
      <div className="flex flex-col h-full bg-background">
        <Header title="Review" />

        <div className="flex-1 flex flex-col px-4 pb-8 pt-6">
          <div className="flex flex-col items-center mb-8">
            <div
              className="size-20 rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: `${ACCENT}22`, boxShadow: `0 12px 32px ${ACCENT}40` }}
            >
              <Check className="size-10 stroke-[3]" style={{ color: ACCENT }} />
            </div>
            <h2 className="text-[22px] font-bold tracking-tight text-center">
              Looks good
            </h2>
            <p className="text-[13px] text-muted-foreground text-center mt-2 max-w-[280px] leading-relaxed">
              Review your choices, then head home — still a demo, nothing is synced.
            </p>
          </div>

          <div
            className="bg-card rounded-[22px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:shadow-none dark:border dark:border-white/[0.08] space-y-4 mb-auto"
          >
            <Row label="Name" value={draft.title} />
            <div className="h-px bg-border" />
            <Row label="Daily target" value={`${draft.minutes} min`} accent />
            <div className="h-px bg-border" />
            <Row label="Style" value={vibeLabel(draft.vibe)} />
          </div>

          <button
            type="button"
            onClick={finish}
            className="w-full h-14 rounded-2xl font-semibold text-base text-white mt-8 active:scale-[0.98] transition-transform shadow-lg"
            style={{ backgroundColor: ACCENT, boxShadow: '0 12px 28px rgba(48,209,88,0.35)' }}
          >
            Done
          </button>
        </div>
      </div>
    </cap-page>
  );
}

function Row({ label, value, accent }: Readonly<{ label: string; value: string; accent?: boolean }>) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-[13px] text-muted-foreground font-medium">{label}</span>
      <span
        className={`text-[15px] font-semibold text-right ${accent ? 'tabular-nums' : ''}`}
        style={accent ? { color: ACCENT } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
