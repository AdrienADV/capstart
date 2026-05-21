import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-col flex-1">
        {/* Hero */}
        <section className="relative px-6 py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-fd-primary/10 via-transparent to-transparent" />

          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-7 items-center lg:items-start">
              <div className="inline-flex self-center lg:self-start items-center gap-2 rounded-full border border-fd-primary/30 bg-fd-primary/10 px-4 py-1.5 text-xs font-semibold text-fd-primary uppercase tracking-widest">
                The best library for CapacitorJS
              </div>

              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-fd-foreground text-center lg:text-left">
                Build beautiful native apps with{' '}
                <span className="text-fd-primary">Capstart</span>
              </h1>

              <p className="text-lg text-fd-muted-foreground leading-relaxed text-center lg:text-left">
                Capstart is the most complete and carefully curated collection
                of UI components built for CapacitorJS. Whether you're
                targeting iOS, Android or the web, you'll find
                production-ready components that feel native on every
                platform — backed by real-world usage in the Capgo ecosystem.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/docs/$"
                  params={{ _splat: '' }}
                  className="px-6 py-3 rounded-xl bg-fd-primary text-fd-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-fd-primary/20"
                  onClick={() => window.umami?.track('cta-hero-browse')}
                >
                  Browse →
                </Link>
                <a
                  href="https://github.com/AdrienADV/capstart/tree/main/capstart-boilerplate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl border border-fd-border bg-fd-background text-fd-foreground font-semibold text-sm hover:bg-fd-muted transition-colors"
                  onClick={() => window.umami?.track('cta-hero-github')}
                >
                  View on GitHub
                </a>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div className="relative w-[240px] sm:w-[280px]">
                  <div className="w-full aspect-[1212/2160] rounded-[2.5rem] bg-fd-muted shadow-2xl shadow-black/40 ring-1 ring-white/10 overflow-hidden">
                    <video
                      src="/landing-page.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      onCanPlay={(e) => { e.currentTarget.playbackRate = 2; }}
                    />
                  </div>

                  <div className="absolute left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-auto lg:right-[-152px] top-[12%] flex items-center gap-1 lg:gap-2 select-none">
                    <svg
                      aria-hidden="true"
                      height="36"
                      viewBox="0 0 72 36"
                      fill="none"
                      className="w-[28px] lg:w-[72px] text-fd-primary"
                    >
                      <path
                        d="M70 8 C52 6, 20 24, 2 24"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M2 24 L9 19 M2 24 L9 29"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-xs lg:text-sm font-bold text-fd-primary whitespace-nowrap">
                      Webview
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1.5 mt-1 select-none">
                  <svg
                    aria-hidden="true"
                    width="32"
                    height="36"
                    viewBox="0 0 32 36"
                    fill="none"
                    className="text-fd-primary"
                  >
                    <path
                      d="M16 34 C14 24, 14 12, 16 3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M16 3 L10 11 M16 3 L22 11"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-sm font-bold text-fd-primary">
                    Native
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-fd-muted/30 px-6 py-20">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="flex flex-col gap-5 text-center lg:text-left">
              <div className="inline-flex self-center lg:self-start items-center gap-2 rounded-full border border-fd-primary/30 bg-fd-primary/10 px-4 py-1.5 text-xs font-semibold text-fd-primary uppercase tracking-widest">
                Same stack. Same habits.
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-fd-foreground sm:text-4xl">
                You won&apos;t be lost when you go mobile.
              </h2>
              <p className="text-base leading-relaxed text-fd-muted-foreground">
                Keep building <strong className="text-fd-foreground">SaaS products</strong>, <strong className="text-fd-foreground">web apps</strong>, and <strong className="text-fd-foreground">native mobile screens</strong>{' '}
                with the tools your team already knows. Capstart keeps{' '}
                <strong className="text-fd-foreground">React</strong>,{' '}
                <strong className="text-fd-foreground">shadcn/ui</strong>, and{' '}
                <strong className="text-fd-foreground">Supabase</strong> at the center of the workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  name: 'React',
                  description: 'Component model',
                  logo: <img src="/logo-react.svg" alt="React" className="h-9 w-9" />,
                },
                {
                  name: 'shadcn/ui',
                  description: 'Design system',
                  logo: <img src="/logo-shadcn.svg" alt="shadcn/ui" className="h-8 w-8 dark:invert" />,
                },
                {
                  name: 'Supabase',
                  description: 'Backend stack',
                  logo: <img src="/logo-supabase.svg" alt="Supabase" className="h-9 w-9" />,
                },
              ].map((technology) => (
                <div
                  key={technology.name}
                  className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-xl border border-fd-border bg-fd-card p-5 text-center transition-colors hover:border-fd-primary/40"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-fd-border bg-fd-muted/50">
                    {technology.logo}
                  </div>
                  <div>
                    <h3 className="font-semibold text-fd-foreground">
                      {technology.name}
                    </h3>
                    <p className="mt-1 text-sm text-fd-muted-foreground">
                      {technology.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-6 py-28 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-fd-primary/5 via-transparent to-transparent" />

          <div className="relative mx-auto max-w-4xl">
            {[
              { src: '/ai-codex.svg', label: 'Codex', cls: 'top-0 left-[8%]' },
              { src: '/ai-copilot.svg', label: 'Copilot', cls: 'top-0 right-[8%]' },
              { src: '/ai-claude.svg', label: 'Claude', cls: 'top-1/2 -translate-y-1/2 left-[-1%]' },
              { src: '/ai-gemini.svg', label: 'Gemini', cls: 'top-1/2 -translate-y-1/2 right-[-1%]' },
              { src: '/ai-grok.svg', label: 'Grok', cls: 'bottom-0 left-[12%]' },
              { src: '/ai-chatgpt.svg', label: 'ChatGPT', cls: 'bottom-0 right-[12%]' },
            ].map(({ src, label, cls }) => (
              <div
                key={label}
                className={`hidden lg:flex absolute ${cls} w-12 h-12 rounded-xl bg-white border border-fd-border shadow-sm items-center justify-center`}
              >
                <img src={src} alt={label} className="w-6 h-6 object-contain" />
              </div>
            ))}

            <div className="text-center flex flex-col items-center gap-5 py-10 lg:py-4">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-fd-foreground leading-tight">
                AI is 100× better at web UI.
                <br />
                <span className="text-fd-primary">Now your app speaks its language.</span>
              </h2>
              <p className="max-w-md text-fd-muted-foreground text-lg leading-relaxed">
                AI mastered Web UI. Not SwiftUI.
                <br />
                Ship web UI natively on iOS & Android.
              </p>
            </div>
          </div>
        </section>

        <section className="relative px-6 py-16 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,var(--tw-gradient-stops))] from-fd-primary/15 via-transparent to-transparent" />
          <div className="mx-auto max-w-5xl">
            <div className="rounded-2xl border border-fd-primary/20 bg-fd-primary/5 px-8 py-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3">
                <h2 className="text-2xl font-extrabold tracking-tight text-fd-foreground sm:text-3xl">
                  Tired of waiting <span className="text-fd-primary">3 days</span> for Apple to approve your update?
                </h2>
                <p className="text-fd-muted-foreground text-base leading-relaxed max-w-lg">
                  Push updates to your users in <strong className="text-fd-foreground">minutes</strong>, not days — no app store review, no waiting. Capgo delivers live updates to your Capacitor app instantly.
                </p>
              </div>
              <div className="shrink-0">
                <a
                  href="https://capgo.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-fd-primary text-fd-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-fd-primary/20 whitespace-nowrap"
                  onClick={() => window.umami?.track('cta-capgo-free')}
                >
                  Try Capgo for free →
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-fd-foreground mb-4">
                Why Capstart?
              </h2>
              <p className="max-w-2xl mx-auto text-fd-muted-foreground text-base leading-relaxed">
                Most UI libraries are designed for the web and retrofitted for
                mobile. Capstart is different — it's built from the ground up
                for hybrid native apps powered by CapacitorJS.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: '⚡',
                  title: 'Native-first design',
                  description:
                    'Every component respects the interaction patterns and visual language of iOS and Android, giving your users a genuinely native feel.',
                },
                {
                  icon: '📦',
                  title: 'The largest collection',
                  description:
                    'From action sheets and toasts to bottom sheets and haptic feedback — the broadest set of CapacitorJS-compatible UI components in one place.',
                },
                {
                  icon: '🔌',
                  title: 'Built on Capacitor plugins',
                  description:
                    'Components integrate seamlessly with the official Capacitor plugin ecosystem, so you get real native APIs, not browser shims.',
                },
                {
                  icon: '🎨',
                  title: 'Fully themeable',
                  description:
                    'CSS variables and design tokens let you match your brand perfectly. Light and dark mode work out of the box.',
                },
                {
                  icon: '📖',
                  title: 'Comprehensive docs',
                  description:
                    'Each component comes with live examples, prop tables, and copy-paste code snippets so you can ship fast.',
                },
                {
                  icon: (
                    <img
                      src="/appstore-logo.png"
                      alt="App Store"
                      className="w-8 h-8 object-contain"
                    />
                  ),
                  title: 'Ship without waiting',
                  description:
                    "Don't wait 2–3 days for Apple validation to ship a new feature — use Capgo.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-fd-border bg-fd-card p-6 flex flex-col gap-3 hover:border-fd-primary/40 transition-colors"
                >
                  <div className="text-3xl">{feature.icon}</div>
                  <h3 className="font-semibold text-fd-foreground text-base">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-fd-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-fd-muted/40 px-6 py-20 text-center">
          <div className="mx-auto max-w-2xl flex flex-col items-center gap-6">
            <h2 className="text-3xl font-bold text-fd-foreground">
              Ready to build your next app?
            </h2>
            <p className="text-fd-muted-foreground text-base leading-relaxed">
              Explore the full component library, read the docs, and start
              integrating Capstart into your CapacitorJS project today.
            </p>
            <Link
              to="/docs/$"
              params={{ _splat: '' }}
              className="px-8 py-3 rounded-xl bg-fd-primary text-fd-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity shadow-lg shadow-fd-primary/20"
              onClick={() => window.umami?.track('cta-getstarted')}
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>
    </HomeLayout>
  );
}
