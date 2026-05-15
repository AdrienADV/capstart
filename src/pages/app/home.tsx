import {
  useRef, useEffect,
  type ElementType, type ReactNode,
} from 'react';
import { setupPage, setDirection } from '@capgo/capacitor-transitions/react';
import { Heart, Footprints, Flame, Moon, Activity, Droplets, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

const C = {
  steps: '#30d158',
  calories: '#ff9f0a',
  sleep: '#bf5af2',
  heart: '#ff3b30',
  water: '#32ade6',
};

const RING_DATA = [
  { r: 100, sw: 13, color: C.steps, progress: 0.82, label: 'Steps', value: '8,234', sub: '/ 10,000' },
  { r: 77, sw: 13, color: C.calories, progress: 0.71, label: 'Calories', value: '423', sub: '/ 600 kcal' },
  { r: 54, sw: 13, color: C.sleep, progress: 0.94, label: 'Sleep', value: '7h 32', sub: '/ 8h' },
];
const SVG_SIZE = 224;
const CENTER = SVG_SIZE / 2;

function TripleRing() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
        <svg width={SVG_SIZE} height={SVG_SIZE} style={{ transform: 'rotate(-90deg)' }}>
          {RING_DATA.map(({ r, sw, color, progress }, i) => {
            const circ = 2 * Math.PI * r;
            return (
              <g key={i}>
                <circle cx={CENTER} cy={CENTER} r={r} fill="none"
                  stroke={color} strokeWidth={sw} opacity={0.18} />
                <circle cx={CENTER} cy={CENTER} r={r} fill="none"
                  stroke={color} strokeWidth={sw} strokeLinecap="round"
                  strokeDasharray={`${circ} ${circ}`}
                  strokeDashoffset={circ * (1 - progress)}
                />
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="text-[38px] font-bold leading-none tracking-tight">87</span>
          <span className="text-[11px] text-muted-foreground font-medium">Health Score</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: `${C.steps}18` }}>
        <span className="text-[12px] font-semibold" style={{ color: C.steps }}>↑ Excellent · +3 pts today</span>
      </div>

      <div className="flex gap-6">
        {RING_DATA.map(({ color, label, value, sub }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[13px] font-semibold tabular-nums leading-none">{value}</span>
            <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
            <span className="text-[10px] text-muted-foreground/50 leading-none">{sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon, value, unit, label, color,
}: {
  icon: ElementType; value: string; unit: string; label: string; color: string;
}) {
  return (
    <div className="bg-card rounded-[22px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:shadow-none dark:border dark:border-white/8">
      <div className="size-9 rounded-full flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}1a` }}>
        <Icon className="size-[18px]" style={{ color }} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[22px] font-bold leading-none tracking-tight">{value}</span>
        <span className="text-[11px] text-muted-foreground font-medium">{unit}</span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{label}</p>
    </div>
  );
}

const ECG_D =
  'M 0,55 L 15,55 C 20,55 22,43 28,43 C 34,43 36,55 42,55' +
  ' L 58,55 L 61,59 L 64,8 L 67,67 C 70,62 73,55 78,55' +
  ' L 84,55 C 88,55 90,38 100,38 C 110,38 112,55 118,55' +
  ' L 145,55 L 160,55 C 165,55 167,43 173,43 C 179,43 181,55 187,55' +
  ' L 203,55 L 206,59 L 209,8 L 212,67 C 215,62 218,55 223,55' +
  ' L 229,55 C 233,55 235,38 245,38 C 255,38 257,55 263,55 L 300,55';

function ECGLine() {
  return (
    <svg viewBox="0 0 300 80" className="w-full h-14">
      <defs>
        <linearGradient id="ecg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={C.heart} stopOpacity="0.3" />
          <stop offset="50%" stopColor={C.heart} stopOpacity="1" />
          <stop offset="100%" stopColor={C.heart} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <path d={ECG_D} fill="none" stroke="url(#ecg)"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GoalBar({
  label, icon: Icon, current, goal, color, unit = '', decimals = 0,
}: {
  label: string; icon: ElementType; current: number; goal: number;
  color: string; unit?: string; decimals?: number;
}) {
  const pct = Math.min(current / goal, 1);
  return (
    <div className="flex items-center gap-3">
      <div className="size-8 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}1a` }}>
        <Icon className="size-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-[12px] mb-1.5">
          <span className="font-medium">{label}</span>
          <span className="text-muted-foreground tabular-nums">
            {current.toFixed(decimals)}{unit}
            <span className="text-muted-foreground/45"> / {goal.toFixed(decimals)}{unit}</span>
          </span>
        </div>
        <div className="h-[7px] rounded-full overflow-hidden" style={{ backgroundColor: `${color}20` }}>
          <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
}

function Card({ children, className = '', onClick }: {
  children: ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <div
      className={`mx-4 bg-card rounded-[22px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:shadow-none dark:border dark:border-white/8 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const pageRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  const goToHeartRate = () => { setDirection('forward'); navigate('/app/details'); };
  const goToProfile = () => { setDirection('forward'); navigate('/app/profile'); };
  const goToCreate = () => { setDirection('forward'); navigate('/app/create'); };

  useEffect(() => {
    if (pageRef.current) {
      return setupPage(pageRef.current);
    }
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <cap-page ref={pageRef}>
      <cap-content>
        <div className="pt-(--safe-area-top) overflow-y-auto pb-28 bg-background">

          <div className="px-5 pt-6 pb-2 flex items-start justify-between">
            <div>
              <p className="text-[12px] text-muted-foreground">{today}</p>
              <h1 className="text-[28px] font-bold tracking-tight leading-tight mt-0.5">{greeting}</h1>
            </div>
            <button onClick={goToProfile} className="size-10 rounded-full bg-orange-500 flex items-center justify-center mt-1 shadow-md shadow-orange-500/30 active:scale-95 transition-transform">
              <span className="text-white font-semibold text-[15px]">A</span>
            </button>
          </div>

          <div className="flex justify-center py-6">
            <TripleRing />
          </div>

          <div className="px-4 grid grid-cols-2 gap-3">
            <MetricCard icon={Heart} value="72" unit="BPM" label="Heart Rate" color={C.heart} />
            <MetricCard icon={Footprints} value="8,234" unit="steps" label="Goal: 10,000" color={C.steps} />
            <MetricCard icon={Flame} value="423" unit="kcal" label="Burned Today" color={C.calories} />
            <MetricCard icon={Moon} value="7h 32" unit="" label="Sleep Duration" color={C.sleep} />
          </div>

          <Card className="mt-3 active:opacity-80 transition-opacity cursor-pointer" onClick={goToHeartRate}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Activity className="size-4" style={{ color: C.heart }} />
                <span className="font-semibold text-[14px]">Heart Rate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.heart }} />
                <span className="text-[11px] font-semibold" style={{ color: C.heart }}>Live</span>
                <ChevronRight className="size-3.5 text-muted-foreground ml-0.5" />
              </div>
            </div>
            <ECGLine />
            <div className="flex justify-between mt-1.5">
              {[['Min', '58 BPM'], ['Avg', '72 BPM'], ['Max', '98 BPM']].map(([k, v]) => (
                <div key={k} className="text-center">
                  <p className="text-[10px] text-muted-foreground">{k}</p>
                  <p className="text-[13px] font-semibold tabular-nums">{v}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="mt-3">
            <p className="font-semibold text-[14px] mb-4">Today's Goals</p>
            <div className="space-y-4">
              <GoalBar icon={Footprints} label="Steps" current={8234} goal={10000} color={C.steps} />
              <GoalBar icon={Flame} label="Calories" current={423} goal={600} color={C.calories} />
              <GoalBar icon={Droplets} label="Hydration" current={1.4} goal={2} color={C.water} unit=" L" decimals={1} />
            </div>
          </Card>

        </div>

        <button
          type="button"
          aria-label="Open create flow"
          onClick={goToCreate}
          className="fixed z-50 size-14 rounded-full flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform bg-orange-500 shadow-orange-500/35"
          style={{
            right: 'max(1.25rem, var(--safe-area-right))',
            bottom: 'calc(1rem + var(--cap-native-navigation-bottom))',
          }}
        >
          <Plus className="size-7 stroke-[2.5]" />
        </button>
      </cap-content>
    </cap-page>
  );
}
