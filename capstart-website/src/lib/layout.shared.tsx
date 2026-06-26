import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { appName, articlesRoute, docsRoute, gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
    },
    links: [
      {
        type: "main",
        text: "Docs",
        url: docsRoute,
      },
      {
        type: "main",
        text: "Articles",
        url: articlesRoute,
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
