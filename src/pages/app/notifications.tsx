import { useRef, useEffect } from 'react';
import { setupPage } from '@capgo/capacitor-transitions/react';
import { Heart, Footprints, Flame, Droplets, Bell } from 'lucide-react';
import Header from '@/components/header';

const NOTIFICATIONS = [
  {
    icon: Heart,
    color: '#ff3b30',
    title: 'High heart rate detected',
    body: 'Your heart rate reached 158 BPM during your workout.',
    time: '2h ago',
  },
  {
    icon: Footprints,
    color: '#30d158',
    title: 'Daily step goal reached!',
    body: 'You hit 10,000 steps. Great job keeping active today.',
    time: '4h ago',
  },
  {
    icon: Flame,
    color: '#ff9f0a',
    title: 'Calorie goal almost met',
    body: 'You\'re 180 kcal away from your daily target.',
    time: '6h ago',
  },
  {
    icon: Droplets,
    color: '#32ade6',
    title: 'Stay hydrated',
    body: 'You\'ve only logged 0.8 L today. Drink more water!',
    time: 'Yesterday',
  },
  {
    icon: Bell,
    color: '#bf5af2',
    title: 'Weekly summary ready',
    body: 'Your health report for last week is available.',
    time: 'Yesterday',
  },
];

export default function Notifications() {
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (pageRef.current) return setupPage(pageRef.current);
  }, []);

  return (
    <cap-page ref={pageRef}>
      <div className="flex flex-col h-full bg-background">
        <Header title="Notifications" />

        <div className="flex-1 overflow-y-auto">
          {NOTIFICATIONS.map(({ icon: Icon, color, title, body, time }, i) => (
            <div key={i}>
              {i > 0 && <div className="h-px bg-border ml-[72px]" />}
              <div className="flex items-start gap-4 px-4 py-4 active:bg-muted/40 transition-colors">
                <div
                  className="size-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon className="size-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-semibold text-[14px] leading-snug">{title}</p>
                    <span className="text-[11px] text-muted-foreground shrink-0">{time}</span>
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">{body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </cap-page>
  );
}
