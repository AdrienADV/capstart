import { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { setupPage } from '@capgo/capacitor-transitions/react';
import Header from '@/components/header';
import { Heart, TrendingDown, TrendingUp, Zap, Moon, Info } from 'lucide-react';
import {
  Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle,
} from '@/components/ui/drawer';

const HR_COLOR = '#ff3b30';

/* ─── 24h fake data [hour, bpm] ──────────────────────────────────────────────── */
const HR_POINTS: [number, number][] = [
  [0, 60], [1, 58], [2, 57], [3, 55], [4, 55], [5, 57],
  [6, 63], [6.5, 76], [7, 88],
  [7.25, 148], [7.5, 158], [7.75, 150],        // workout spike
  [8, 112], [8.3, 88], [8.6, 78],
  [9, 73], [10, 75], [11, 77], [12, 79],
  [13, 76], [13.5, 83], [14, 72],
];

const WEEKLY = [
  { day: 'M', avg: 71 }, { day: 'T', avg: 74 }, { day: 'W', avg: 68 },
  { day: 'T', avg: 76 }, { day: 'F', avg: 79 }, { day: 'S', avg: 85 },
  { day: 'S', avg: 72, today: true },
];

const ZONES = [
  { name: 'Peak',     range: '140+ BPM',    time: '11 min', color: '#ff3b30', fill: 0.18 },
  { name: 'Cardio',   range: '100–140 BPM', time: '42 min', color: '#ff9f0a', fill: 0.52 },
  { name: 'Fat Burn', range: '60–100 BPM',  time: '6h 52m', color: '#30d158', fill: 1.00 },
  { name: 'Resting',  range: '50–60 BPM',   time: '6h 15m', color: '#32ade6', fill: 0.91 },
];

/* ─── SVG chart helpers ──────────────────────────────────────────────────────── */
const CW = 320;
const CH = 110;
const BPM_LO = 40;
const BPM_HI = 170;

function toX(h: number) { return (h / 24) * CW; }
function toY(bpm: number) { return CH - ((bpm - BPM_LO) / (BPM_HI - BPM_LO)) * CH; }

function buildChartPath(pts: [number, number][]) {
  const spike = [7, 11];          // indices of the spike region (sharp lines)
  let d = `M ${toX(pts[0][0])},${toY(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = [toX(pts[i - 1][0]), toY(pts[i - 1][1])];
    const [cx, cy] = [toX(pts[i][0]), toY(pts[i][1])];
    if (i >= spike[0] && i <= spike[1]) {
      d += ` L ${cx},${cy}`;
    } else {
      const cpx = (px + cx) / 2;
      d += ` C ${cpx},${py} ${cpx},${cy} ${cx},${cy}`;
    }
  }
  return d;
}

function buildFillPath(pts: [number, number][]) {
  const last = pts[pts.length - 1];
  return `${buildChartPath(pts)} L ${toX(last[0])},${CH} L ${toX(pts[0][0])},${CH} Z`;
}

/* ─── Animated chart ─────────────────────────────────────────────────────────── */
function HeartRateChart() {
  const lineRef = useRef<SVGPathElement>(null);
  const linePath = buildChartPath(HR_POINTS);
  const fillPath = buildFillPath(HR_POINTS);

  useEffect(() => {
    const p = lineRef.current;
    if (!p) return;
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
    const anim = p.animate(
      [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
      { duration: 2000, easing: 'ease-out', fill: 'forwards', delay: 300 }
    );
    return () => anim.cancel();
  }, []);

  const nowX = toX(14);
  const gridBPMs = [60, 90, 120, 150];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${CW} ${CH + 20}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="hrFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={HR_COLOR} stopOpacity="0.25" />
            <stop offset="100%" stopColor={HR_COLOR} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hrLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={HR_COLOR} stopOpacity="0.4" />
            <stop offset="60%" stopColor={HR_COLOR} stopOpacity="1" />
            <stop offset="100%" stopColor={HR_COLOR} stopOpacity="0.7" />
          </linearGradient>
          <clipPath id="chartClip">
            <rect x="0" y="0" width={CW} height={CH} />
          </clipPath>
        </defs>

        {/* Grid lines */}
        {gridBPMs.map(bpm => (
          <g key={bpm}>
            <line x1={0} y1={toY(bpm)} x2={CW} y2={toY(bpm)}
              stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4"
              className="text-muted-foreground/20" />
            <text x={CW - 2} y={toY(bpm) - 3} fontSize="8" fill="currentColor"
              textAnchor="end" className="fill-muted-foreground/40">{bpm}</text>
          </g>
        ))}

        {/* "Now" vertical line */}
        <line x1={nowX} y1={0} x2={nowX} y2={CH}
          stroke={HR_COLOR} strokeWidth="1" strokeDasharray="3 3" opacity={0.5} />
        <text x={nowX} y={CH + 14} fontSize="8" fill={HR_COLOR} textAnchor="middle" opacity={0.8}>Now</text>

        {/* Fill area */}
        <path d={fillPath} fill="url(#hrFill)" clipPath="url(#chartClip)" />

        {/* Line */}
        <path ref={lineRef} d={linePath} fill="none"
          stroke="url(#hrLine)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          clipPath="url(#chartClip)" />

        {/* Current dot */}
        <circle cx={nowX} cy={toY(72)} r="4" fill={HR_COLOR} />
        <circle cx={nowX} cy={toY(72)} r="4" fill={HR_COLOR} opacity="0.3">
          <animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
        </circle>

        {/* Time axis labels */}
        {[['12 AM', 0], ['6 AM', 6], ['12 PM', 12]].map(([label, h]) => (
          <text key={label} x={toX(Number(h))} y={CH + 14} fontSize="8"
            fill="currentColor" textAnchor="middle" className="fill-muted-foreground/50">
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ─── Count-up ───────────────────────────────────────────────────────────────── */
function useCountUp(to: number, duration = 900, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
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
  }, [to, duration, delay]);
  return val;
}

/* ─── Card ───────────────────────────────────────────────────────────────────── */
function Card({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`mx-4 bg-card rounded-[22px] p-4
        shadow-[0_2px_12px_rgba(0,0,0,0.07)]
        dark:shadow-none dark:border dark:border-white/[0.08] ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─── Min BPM Drawer content ─────────────────────────────────────────────────── */
const ZONE_SEGMENTS = [
  { pct: 15.4, color: '#32ade6', label: 'Resting'  },
  { pct: 30.8, color: '#30d158', label: 'Fat Burn' },
  { pct: 30.8, color: '#ff9f0a', label: 'Cardio'   },
  { pct: 23.0, color: '#ff3b30', label: 'Peak'     },
];
// 58 BPM on scale 40–170 → (58-40)/(170-40) = 13.85 %
const MARKER_PCT = ((58 - 40) / (170 - 40)) * 100;

function MinBPMDrawer() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="px-5 pb-10">
      {/* ── Hero ── */}
      <div className="flex items-start justify-between pt-1 pb-6">
        <div>
          <p className="text-[12px] text-muted-foreground mb-1">Minimum heart rate</p>
          <div className="flex items-baseline gap-1.5">
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 16, delay: 0.05 }}
              className="text-[52px] font-bold leading-none tabular-nums"
              style={{ color: '#32ade6' }}
            >58</motion.span>
            <span className="text-[17px] font-semibold text-muted-foreground">BPM</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <Moon className="size-3.5 text-muted-foreground" />
            <span className="text-[12px] text-muted-foreground">Today at 3:24 AM · During sleep</span>
          </div>
        </div>
        <div className="size-14 rounded-full flex items-center justify-center mt-1"
          style={{ backgroundColor: '#32ade615' }}>
          <TrendingDown className="size-6" style={{ color: '#32ade6' }} />
        </div>
      </div>

      {/* ── Zone range bar ── */}
      <div className="mb-6">
        <p className="text-[12px] font-semibold mb-3">BPM Scale</p>

        {/* Bar + marker */}
        <div className="relative">
          <div className="flex h-3 rounded-full overflow-hidden">
            {ZONE_SEGMENTS.map(({ pct, color, label }) => (
              <div key={label} style={{ width: `${pct}%`, backgroundColor: color }} />
            ))}
          </div>

          {/* Marker */}
          <motion.div
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${MARKER_PCT}%`, transform: 'translateX(-50%)' }}
            initial={{ opacity: 0, y: -6 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, type: 'spring', damping: 14 }}
          >
            <div className="w-[3px] h-5 rounded-full bg-foreground" />
            <span className="text-[9px] font-bold text-foreground mt-0.5 whitespace-nowrap">58 BPM</span>
          </motion.div>
        </div>

        {/* Zone labels */}
        <div className="flex justify-between mt-6 text-[9px] text-muted-foreground/70">
          {ZONE_SEGMENTS.map(({ label }) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      {/* ── Zone badge ── */}
      <div className="flex items-center gap-3 p-4 rounded-[18px] mb-4"
        style={{ backgroundColor: '#32ade610' }}>
        <TrendingDown className="size-5 shrink-0" style={{ color: '#32ade6' }} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[13px]">Resting Zone</p>
          <p className="text-[12px] text-muted-foreground">50–60 BPM · Excellent recovery</p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0"
          style={{ backgroundColor: '#32ade620', color: '#32ade6' }}>✓ Normal</span>
      </div>

      {/* ── Mini stats ── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-card rounded-[16px] p-4
          shadow-[0_2px_8px_rgba(0,0,0,0.06)]
          dark:shadow-none dark:border dark:border-white/[0.08]">
          <p className="text-[11px] text-muted-foreground">vs. Daily avg</p>
          <p className="text-[24px] font-bold leading-none mt-1" style={{ color: '#30d158' }}>−14</p>
          <p className="text-[10px] text-muted-foreground mt-1">BPM below avg of 72</p>
        </div>
        <div className="bg-card rounded-[16px] p-4
          shadow-[0_2px_8px_rgba(0,0,0,0.06)]
          dark:shadow-none dark:border dark:border-white/[0.08]">
          <p className="text-[11px] text-muted-foreground">30-day record</p>
          <p className="text-[24px] font-bold leading-none mt-1">Best</p>
          <p className="text-[10px] text-muted-foreground mt-1">Lowest this month</p>
        </div>
      </div>

      {/* ── Insight ── */}
      <div className="flex items-start gap-3 p-4 rounded-[18px] bg-muted/40">
        <Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          A resting heart rate below 60 BPM indicates excellent cardiovascular fitness.
          Recorded during your deepest sleep phase — when your heart naturally reaches its lowest.
        </p>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function Details() {
  const pageRef = useRef<HTMLElement>(null);
  const bpm = useCountUp(72, 800, 200);
  const weekMax = Math.max(...WEEKLY.map(d => d.avg));

  useEffect(() => {
    if (pageRef.current) return setupPage(pageRef.current);
  }, []);

  return (
    <cap-page ref={pageRef}>
      <div className="flex flex-col h-full bg-background">
        <Header title="Heart Rate" />

        <div className="flex-1 overflow-y-auto pb-10">

          {/* ── Hero ── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38 }}
            className="px-5 pt-5 pb-4 flex items-center justify-between"
          >
            <div>
              <p className="text-[12px] text-muted-foreground mb-1">Current</p>
              <div className="flex items-baseline gap-2">
                <span className="text-[52px] font-bold leading-none tracking-tight"
                  style={{ color: HR_COLOR }}>{bpm}</span>
                <span className="text-[16px] font-semibold text-muted-foreground">BPM</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="inline-block size-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: HR_COLOR }} />
                <span className="text-[12px] font-medium" style={{ color: HR_COLOR }}>Live · Normal range</span>
              </div>
            </div>

            {/* Pulsing heart */}
            <div className="relative flex items-center justify-center size-16">
              <motion.div
                animate={{ scale: [1, 1.18, 1] }}
                transition={{ repeat: Infinity, duration: 0.75, ease: 'easeInOut', repeatDelay: 0.15 }}
                className="absolute"
              >
                <Heart className="size-14 fill-current" style={{ color: `${HR_COLOR}20` }} />
              </motion.div>
              <Heart className="size-8 fill-current relative z-10" style={{ color: HR_COLOR }} />
            </div>
          </motion.div>

          {/* ── Stats row ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.38 }}
            className="mx-4 grid grid-cols-3 gap-2 mb-3"
          >
            {/* Min — opens bottom drawer */}
            <Drawer>
              <DrawerTrigger asChild>
                <button
                  className="bg-card rounded-[18px] p-3 flex flex-col items-center gap-1
                    shadow-[0_2px_8px_rgba(0,0,0,0.06)]
                    dark:shadow-none dark:border dark:border-white/[0.08]
                    active:scale-95 transition-transform w-full"
                >
                  <TrendingDown className="size-4" style={{ color: '#32ade6' }} />
                  <span className="text-[20px] font-bold leading-none tabular-nums">58</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Min BPM</span>
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className="text-center text-[16px]">Minimum Heart Rate</DrawerTitle>
                </DrawerHeader>
                <MinBPMDrawer />
              </DrawerContent>
            </Drawer>

            {/* Avg + Max */}
            {[
              { label: 'Avg', value: '72',  icon: Heart,       color: HR_COLOR  },
              { label: 'Max', value: '158', icon: TrendingUp,  color: '#ff9f0a' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label}
                className="bg-card rounded-[18px] p-3 flex flex-col items-center gap-1
                  shadow-[0_2px_8px_rgba(0,0,0,0.06)]
                  dark:shadow-none dark:border dark:border-white/[0.08]"
              >
                <Icon className="size-4" style={{ color }} />
                <span className="text-[20px] font-bold leading-none tabular-nums">{value}</span>
                <span className="text-[10px] text-muted-foreground font-medium">{label} BPM</span>
              </div>
            ))}
          </motion.div>

          {/* ── 24h chart ── */}
          <Card delay={0.18} className="mb-3">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-[14px]">Today</span>
              <span className="text-[11px] text-muted-foreground">24h view</span>
            </div>
            <HeartRateChart />
          </Card>

          {/* ── Heart rate zones ── */}
          <Card delay={0.26} className="mb-3">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="size-4" style={{ color: '#ff9f0a' }} />
              <span className="font-semibold text-[14px]">Heart Rate Zones</span>
            </div>
            <div className="space-y-3.5">
              {ZONES.map(({ name, range, time, color, fill }, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.07 }}
                >
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="font-semibold">{name}</span>
                      <span className="text-muted-foreground">{range}</span>
                    </div>
                    <span className="font-semibold tabular-nums">{time}</span>
                  </div>
                  <ZoneBar color={color} fill={fill} />
                </motion.div>
              ))}
            </div>
          </Card>

          {/* ── Weekly trend ── */}
          <Card delay={0.34} className="mb-3">
            <span className="font-semibold text-[14px]">Weekly Average</span>
            <div className="flex items-end justify-between gap-1.5 mt-4 h-16">
              {WEEKLY.map(({ day, avg, today }, i) => {
                const h = ((avg - 60) / (weekMax - 60)) * 100;
                return (
                  <div key={`${day}-${i}`} className="flex-1 flex flex-col items-center gap-1.5">
                    <motion.div
                      className="w-full rounded-full"
                      style={{ backgroundColor: today ? HR_COLOR : `${HR_COLOR}30`, minHeight: 4 }}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(h, 8)}%` }}
                      transition={{ delay: 0.45 + i * 0.06, duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
                    />
                    <span className="text-[10px] text-muted-foreground font-medium">{day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-3 text-[11px] text-muted-foreground">
              <span>Avg this week</span>
              <span className="font-semibold text-foreground">75 BPM</span>
            </div>
          </Card>

          {/* ── Resting HR info ── */}
          <Card delay={0.42}>
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${HR_COLOR}15` }}>
                <Heart className="size-4 fill-current" style={{ color: HR_COLOR }} />
              </div>
              <div>
                <p className="font-semibold text-[13px]">Resting Heart Rate</p>
                <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                  Your resting heart rate of <span className="font-semibold text-foreground">58 BPM</span> is in the
                  excellent range for your age group (55–65 BPM). This indicates strong cardiovascular fitness.
                </p>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </cap-page>
  );
}

/* ─── Zone bar with animation ────────────────────────────────────────────────── */
function ZoneBar({ color, fill }: { color: string; fill: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(fill * 100), 500);
    return () => clearTimeout(t);
  }, [fill]);
  return (
    <div className="h-[6px] rounded-full overflow-hidden" style={{ backgroundColor: `${color}20` }}>
      <div className="h-full rounded-full transition-all duration-[900ms] ease-out"
        style={{ width: `${w}%`, backgroundColor: color }} />
    </div>
  );
}
