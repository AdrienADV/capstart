import type { MetaDescriptor } from "@tanstack/react-router";

export const siteUrl = "https://capstart.dev";
export const siteName = "Capstart";
export const defaultSocialImage = `${siteUrl}/og-image.png`;

const defaultImageAlt =
  "Capstart preview card for CapacitorJS native app components";

function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

function withSiteName(title: string) {
  return title.includes(siteName) ? title : `${title} - ${siteName}`;
}

export function createSeo({
  title,
  description,
  path,
  type = "website",
  image = defaultSocialImage,
  imageAlt = defaultImageAlt,
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
  imageAlt?: string;
}) {
  const pageTitle = withSiteName(title);
  const url = absoluteUrl(path);

  return {
    meta: [
      { title: pageTitle },
      {
        name: "description",
        content: description,
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        property: "og:type",
        content: type,
      },
      {
        property: "og:site_name",
        content: siteName,
      },
      {
        property: "og:title",
        content: pageTitle,
      },
      {
        property: "og:description",
        content: description,
      },
      {
        property: "og:url",
        content: url,
      },
      {
        property: "og:image",
        content: image,
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
        content: imageAlt,
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: pageTitle,
      },
      {
        name: "twitter:description",
        content: description,
      },
      {
        name: "twitter:image",
        content: image,
      },
    ] satisfies MetaDescriptor[],
    links: [
      {
        rel: "canonical",
        href: url,
      },
    ],
  };
}
