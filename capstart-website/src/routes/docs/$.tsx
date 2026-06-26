import { createFileRoute, notFound } from '@tanstack/react-router';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { createServerFn } from '@tanstack/react-start';
import { slugsToMarkdownPath, source } from '@/lib/source';
import browserCollections from 'collections/browser';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { baseOptions } from '@/lib/layout.shared';
import { gitConfig } from '@/lib/shared';
import { createSeo } from '@/lib/seo';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { Suspense, useEffect } from 'react';
import { getCalApi } from '@calcom/embed-react';
import { useMDXComponents } from '@/components/mdx';

export const Route = createFileRoute('/docs/$')({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    const data = await serverLoader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};

    return createSeo({
      title: loaderData.title,
      description: loaderData.description,
      path: loaderData.url,
      type: "article",
    });
  },
});

const serverLoader = createServerFn({
  method: 'GET',
})
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    return {
      path: page.path,
      title: page.data.title,
      description: page.data.description ?? page.data.title,
      url: page.url,
      markdownUrl: slugsToMarkdownPath(page.slugs).url,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: MDX },
    {
      markdownUrl,
      path,
    }: {
      markdownUrl: string;
      path: string;
    },
  ) {
    useEffect(() => {
      (async () => {
        const cal = await getCalApi({ namespace: 'capstart' });
        cal('ui', { hideEventTypeDetails: false, layout: 'month_view' });
      })();
    }, []);

    return (
      <>
        <DocsPage toc={toc}>
          <DocsTitle>{frontmatter.title}</DocsTitle>
          <DocsDescription>{frontmatter.description}</DocsDescription>
          <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
            <MarkdownCopyButton markdownUrl={markdownUrl} />
            <ViewOptionsPopover
              markdownUrl={markdownUrl}
              githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
            />
          </div>
          <DocsBody>
            <MDX components={useMDXComponents()} />
          </DocsBody>
        </DocsPage>

        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 rounded-xl border border-fd-primary/30 bg-fd-background/95 backdrop-blur-sm shadow-lg px-4 py-4 w-56">
          <p className="font-semibold text-fd-foreground text-sm leading-snug">
            Need help with your app?
          </p>
          <p className="text-xs text-fd-muted-foreground leading-relaxed">
            Our team can help you integrate Capstart.
          </p>
          <button
            data-cal-namespace="capstart"
            data-cal-link="adrien-adv/capstart"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
            className="px-3 py-1.5 rounded-lg bg-fd-primary text-fd-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity text-center cursor-pointer"
          >
            Contact us →
          </button>
        </div>
      </>
    );
  },
});

function Page() {
  const { path, pageTree, markdownUrl } = useFumadocsLoader(Route.useLoaderData());

  return (
    <DocsLayout {...baseOptions()} tree={pageTree}>
      <Suspense>{clientLoader.useContent(path, { markdownUrl, path })}</Suspense>
    </DocsLayout>
  );
}
