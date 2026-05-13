import {
  useRef, useEffect, useState, createContext, useContext,
  type ElementType, type ReactNode,
} from 'react';
import { motion } from 'motion/react';
import { setupPage, setDirection } from '@capgo/capacitor-transitions/react';
import { Heart, Footprints, Flame, Moon, Activity, Droplets, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

/* ─── Apple Health palette ─────────────────────────────────────────────────── */
const C = {
  steps: '#30d158',
  calories: '#ff9f0a',
  sleep: '#bf5af2',
  heart: '#ff3b30',
  water: '#32ade6',
};

/* ─── Skip-animations context ────────────────────────────────────────────────
 * Module-level flag survives unmount/remount of Home (React Router nav).
 * First visit → skip=false (animations play). Subsequent visits → skip=true.
 * ─────────────────────────────────────────────────────────────────────────── */
let _homeLoaded = false;
const SkipCtx = createContext(false);
const useSkip = () => useContext(SkipCtx);

/* ─── Count-up hook ─────────────────────────────────────────────────────────── */
function useCountUp(to: number, duration = 1400, delay = 0) {
  const skip = useSkip();
  const [val, setVal] = useState(skip ? to : 0);

  useEffect(() => {
    if (skip) return;
    const t = setTimeout(() => {
      let start: number | null = null;
      const ease = (x: number) => 1 - Math.pow(1 - x, 3);
      const frame = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        setVal(Math.round(to * ease(p)));
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }, delay);
    return () => clearTimeout(t);
  }, [to, duration, delay, skip]);

  return val;
}

/* ─── Triple Activity Ring (Apple Watch style) ──────────────────────────────── */
/*
 * Ring geometry for SVG_SIZE=224, CENTER=112, stroke=13:
 *   outer  r=100 → inner-edge=93.5  outer-edge=106.5  (margin 5.5px)
 *   middle r=77  → inner-edge=70.5  outer-edge=83.5   (gap 10px)
 *   inner  r=54  → inner-edge=47.5  outer-edge=60.5   (gap 10px)
 *   centre inscribed square ≈ 67px — fits "87 + Health Score" comfortably
 */
const RING_DATA = [
  { r: 100, sw: 13, color: C.steps, progress: 0.82, label: 'Steps', value: '8,234', sub: '/ 10,000' },
  { r: 77, sw: 13, color: C.calories, progress: 0.71, label: 'Calories', value: '423', sub: '/ 600 kcal' },
  { r: 54, sw: 13, color: C.sleep, progress: 0.94, label: 'Sleep', value: '7h 32', sub: '/ 8h' },
];
const SVG_SIZE = 224;
const CENTER = SVG_SIZE / 2;

function TripleRing() {
  const skip = useSkip();
  const [go, setGo] = useState(skip);
  const score = useCountUp(87, 1800, 550);

  useEffect(() => {
    if (skip) return;
    const t = setTimeout(() => setGo(true), 380);
    return () => clearTimeout(t);
  }, [skip]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
        <svg width={SVG_SIZE} height={SVG_SIZE} style={{ transform: 'rotate(-90deg)' }}>
          {RING_DATA.map(({ r, sw, color, progress }, i) => {
            const circ = 2 * Math.PI * r;
            const offset = go ? circ * (1 - progress) : circ;
            return (
              <g key={i}>
                <circle cx={CENTER} cy={CENTER} r={r} fill="none"
                  stroke={color} strokeWidth={sw} opacity={0.18} />
                <circle cx={CENTER} cy={CENTER} r={r} fill="none"
                  stroke={color} strokeWidth={sw} strokeLinecap="round"
                  strokeDasharray={`${circ} ${circ}`}
                  strokeDashoffset={offset}
                  style={{ transition: skip ? 'none' : `stroke-dashoffset 1.7s cubic-bezier(0.34,1.15,0.64,1) ${i * 0.13}s` }}
                />
              </g>
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="text-[38px] font-bold leading-none tracking-tight">{score}</span>
          <span className="text-[11px] text-muted-foreground font-medium">Health Score</span>
        </div>
      </div>

      <motion.div
        initial={skip ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={skip ? {} : { delay: 2.1, type: 'spring', damping: 16 }}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full"
        style={{ backgroundColor: `${C.steps}18` }}
      >
        <span className="text-[12px] font-semibold" style={{ color: C.steps }}>↑ Excellent · +3 pts today</span>
      </motion.div>

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

/* ─── Metric card ────────────────────────────────────────────────────────────── */
function MetricCard({
  icon: Icon, value, unit, label, color, delay = 0, countDelay = 0,
}: {
  icon: ElementType; value: number; unit: string;
  label: string; color: string; delay?: number; countDelay?: number;
}) {
  const skip = useSkip();
  const v = useCountUp(value, 1300, countDelay);

  return (
    <motion.div
      initial={skip ? false : { opacity: 0, y: 22, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={skip ? {} : { delay, duration: 0.44, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-card rounded-[22px] p-4
        shadow-[0_2px_12px_rgba(0,0,0,0.07)]
        dark:shadow-none dark:border dark:border-white/[0.08]"
    >
      <div className="size-9 rounded-full flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}1a` }}>
        <Icon className="size-[18px]" style={{ color }} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[22px] font-bold leading-none tracking-tight">
          {v.toLocaleString('en-US')}
        </span>
        <span className="text-[11px] text-muted-foreground font-medium">{unit}</span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{label}</p>
    </motion.div>
  );
}

/* ─── Animated ECG line ──────────────────────────────────────────────────────── */
const ECG_D =
  'M 0,55 L 15,55 C 20,55 22,43 28,43 C 34,43 36,55 42,55' +
  ' L 58,55 L 61,59 L 64,8 L 67,67 C 70,62 73,55 78,55' +
  ' L 84,55 C 88,55 90,38 100,38 C 110,38 112,55 118,55' +
  ' L 145,55 L 160,55 C 165,55 167,43 173,43 C 179,43 181,55 187,55' +
  ' L 203,55 L 206,59 L 209,8 L 212,67 C 215,62 218,55 223,55' +
  ' L 229,55 C 233,55 235,38 245,38 C 255,38 257,55 263,55 L 300,55';

function ECGLine() {
  const skip = useSkip();
  const ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    const p = ref.current;
    if (!p || skip) return;
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
    const anim = p.animate(
      [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
      { duration: 2400, easing: 'ease-in-out', fill: 'forwards', delay: 750 }
    );
    return () => anim.cancel();
  }, [skip]);

  return (
    <svg viewBox="0 0 300 80" className="w-full h-14">
      <defs>
        <linearGradient id="ecg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={C.heart} stopOpacity="0.3" />
          <stop offset="50%" stopColor={C.heart} stopOpacity="1" />
          <stop offset="100%" stopColor={C.heart} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <path ref={ref} d={ECG_D} fill="none" stroke="url(#ecg)"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Goal progress bar ──────────────────────────────────────────────────────── */
function GoalBar({
  label, icon: Icon, current, goal, color, unit = '', decimals = 0,
}: {
  label: string; icon: ElementType; current: number; goal: number;
  color: string; unit?: string; decimals?: number;
}) {
  const skip = useSkip();
  const pct = Math.min(current / goal, 1);
  const [w, setW] = useState(skip ? pct * 100 : 0);

  useEffect(() => {
    if (skip) return;
    const t = setTimeout(() => setW(pct * 100), 950);
    return () => clearTimeout(t);
  }, [pct, skip]);

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
          <div className="h-full rounded-full transition-all duration-[1100ms] ease-out"
            style={{ width: `${w}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Card wrapper ───────────────────────────────────────────────────────────── */
function Card({ children, delay = 0, className = '', onClick }: {
  children: ReactNode; delay?: number; className?: string; onClick?: () => void;
}) {
  const skip = useSkip();
  return (
    <motion.div
      initial={skip ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={skip ? {} : { delay, duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`mx-4 bg-card rounded-[22px] p-4
        shadow-[0_2px_12px_rgba(0,0,0,0.07)]
        dark:shadow-none dark:border dark:border-white/[0.08] ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

/* ─── Home screen ────────────────────────────────────────────────────────────── */
export default function Home() {
  const pageRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  /* skip = true on every visit after the first */
  const [skip] = useState<boolean>(() => {
    const s = _homeLoaded;
    _homeLoaded = true;
    return s;
  });

  const goToHeartRate = () => {
    setDirection('forward');
    navigate('/app/details');
  };

  const goToProfile = () => {
    setDirection('forward');
    navigate('/app/profile');
  };

  const goToCreate = () => {
    setDirection('forward');
    navigate('/app/create');
  };

  useEffect(() => {
    if (pageRef.current) return setupPage(pageRef.current);
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <cap-page ref={pageRef}>
      <SkipCtx.Provider value={skip}>
        <cap-content>
          <div className="pt-(--safe-area-top) overflow-y-auto pb-28 bg-background">

            {/* ── Header ── */}
            <motion.div
              initial={skip ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={skip ? {} : { duration: 0.36 }}
              className="px-5 pt-6 pb-2 flex items-start justify-between"
            >
              <div>
                <p className="text-[12px] text-muted-foreground">{today}</p>
                <h1 className="text-[28px] font-bold tracking-tight leading-tight mt-0.5">
                  {greeting}
                </h1>
              </div>
              <button onClick={goToProfile} className="size-10 rounded-full bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center mt-1 shadow-md shadow-indigo-500/30 active:scale-95 transition-transform">
                <span className="text-white font-semibold text-[15px]">A</span>
              </button>
            </motion.div>

            {/* ── Triple activity ring ── */}
            <motion.div
              initial={skip ? false : { opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={skip ? {} : { delay: 0.1, duration: 0.5, type: 'spring', damping: 18, stiffness: 190 }}
              className="flex justify-center py-6"
            >
              <TripleRing />
            </motion.div>

            {/* ── Metrics 2×2 ── */}
            <div className="px-4 grid grid-cols-2 gap-3">
              <MetricCard icon={Heart} value={72} unit="BPM" label="Heart Rate" color={C.heart} delay={0.22} countDelay={360} />
              <MetricCard icon={Footprints} value={8234} unit="steps" label="Goal: 10,000" color={C.steps} delay={0.30} countDelay={440} />
              <MetricCard icon={Flame} value={423} unit="kcal" label="Burned Today" color={C.calories} delay={0.38} countDelay={520} />
              <MetricCard icon={Moon} value={7} unit="h 32" label="Sleep Duration" color={C.sleep} delay={0.46} countDelay={600} />
            </div>

            {/* ── Heart rate / ECG ── */}
            <Card delay={0.54} className="mt-3 active:opacity-80 transition-opacity cursor-pointer" onClick={goToHeartRate}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="size-4" style={{ color: C.heart }} />
                  <span className="font-semibold text-[14px]">Heart Rate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block size-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: C.heart }} />
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

            {/* ── Daily goals ── */}
            <Card delay={0.62} className="mt-3">
              <p className="font-semibold text-[14px] mb-4">Today's Goals</p>
              <div className="space-y-4">
                <GoalBar icon={Footprints} label="Steps" current={8234} goal={10000} color={C.steps} />
                <GoalBar icon={Flame} label="Calories" current={423} goal={600} color={C.calories} />
                <GoalBar icon={Droplets} label="Hydration" current={1.4} goal={2} color={C.water} unit=" L" decimals={1} />
              </div>
            </Card>

          </div>

          {/* Floating add (demo create flow) — outside scroll so overflow cannot clip */}
          <motion.button
            type="button"
            aria-label="Open create flow"
            initial={skip ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={skip ? {} : { delay: 0.85, type: 'spring', damping: 14, stiffness: 260 }}
            onClick={goToCreate}
            className="fixed z-50 size-14 rounded-full flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform bg-linear-to-br from-violet-500 to-indigo-600 shadow-indigo-500/35"
            style={{
              right: 'max(1.25rem, var(--safe-area-right))',
              bottom: 'calc(1rem + var(--cap-native-navigation-bottom))',
            }}
          >
            <Plus className="size-7 stroke-[2.5]" />
          </motion.button>
        </cap-content>
      </SkipCtx.Provider>
    </cap-page>
  );
}
