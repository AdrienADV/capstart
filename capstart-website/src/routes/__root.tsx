import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import {
  createSeo,
  defaultSocialImage,
  siteName,
} from "@/lib/seo";
import appCss from "@/styles/app.css?url";

const siteTitle = "Capstart - A simple guide to build CapacitorJS Apps";
const siteDescription =
  "Build beautiful native iOS, Android, and web apps with Capstart, a curated CapacitorJS component library.";

const analyticsScript = {
  src: "https://analytics.itswhereishipeverything.space/script.js",
  defer: true,
  "data-website-id": "81097c07-632a-4b4d-bda5-92020255f0cc",
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...createSeo({
        title: siteTitle,
        description: siteDescription,
        path: "/",
        image: defaultSocialImage,
        imageAlt: `${siteName} preview card for CapacitorJS native app components`,
      }).meta,
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
    scripts: import.meta.env.PROD ? [analyticsScript] : [],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <Outlet />
        </RootProvider>
        <footer className="py-4 text-center text-sm text-fd-muted-foreground">
          built with{" "}
          <span aria-label="croissant" role="img">
            🥐
          </span>{" "}
          by{" "}
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
