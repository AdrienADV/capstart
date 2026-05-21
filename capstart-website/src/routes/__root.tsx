import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import * as React from 'react';
import appCss from '@/styles/app.css?url';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';

const analyticsScript = {
  src: 'https://analytics.itswhereishipeverything.space/script.js',
  defer: true,
  'data-website-id': '81097c07-632a-4b4d-bda5-92020255f0cc',
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Capstart',
        description: 'The best guide for building native apps with CapacitorJS',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
    scripts: import.meta.env.PROD ? [analyticsScript] : [],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <Outlet />
        </RootProvider>
        <footer className="py-4 text-center text-sm text-fd-muted-foreground">
          built with{' '}
          <span aria-label="croissant" role="img">
            🥐
          </span>{' '}
          by{' '}
          <a
            href="https://x.com/AdrienADV"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-fd-foreground hover:underline"
          >
            Adrien
          </a>
        </footer>
        <Scripts />
      </body>
    </html>
  );
}
