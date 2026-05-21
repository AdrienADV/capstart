import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import appCss from "@/styles/app.css?url";

const siteUrl = "https://capstart.dev";
const siteTitle = "Capstart - A simple guide to build CapacitorJS Apps";
const siteDescription =
  "Build beautiful native iOS, Android, and web apps with Capstart, a curated CapacitorJS component library.";
const socialImage = `${siteUrl}/og-image.png`;

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
      { title: siteTitle },
      {
        name: "description",
        content: siteDescription,
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:site_name",
        content: "Capstart",
      },
      {
        property: "og:title",
        content: siteTitle,
      },
      {
        property: "og:description",
        content: siteDescription,
      },
      {
        property: "og:url",
        content: siteUrl,
      },
      {
        property: "og:image",
        content: socialImage,
      },
      {
        property: "og:image:width",
        content: "2490",
      },
      {
        property: "og:image:height",
        content: "1354",
      },
      {
        property: "og:image:alt",
        content: "Capstart preview card for CapacitorJS native app components",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: siteTitle,
      },
      {
        name: "twitter:description",
        content: siteDescription,
      },
      {
        name: "twitter:image",
        content: socialImage,
      },
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
