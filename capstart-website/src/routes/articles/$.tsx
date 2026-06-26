import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import browserCollections from "collections/browser";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { Suspense } from "react";
import { getMDXComponents } from "@/components/mdx";
import { articleSource } from "@/lib/articles";
import { baseOptions } from "@/lib/layout.shared";

export const Route = createFileRoute("/articles/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/").filter(Boolean) ?? [];

    if (slugs.length === 0) {
      return indexLoader();
    }

    const data = await articleLoader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
});

const indexLoader = createServerFn({
  method: "GET",
}).handler(async () => ({
  type: "index" as const,
  articles: articleSource.getPages().map((page) => ({
    title: page.data.title,
    description: page.data.description,
    url: page.url,
  })),
}));

const articleLoader = createServerFn({
  method: "GET",
})
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = articleSource.getPage(slugs);
    if (!page) throw notFound();

    return {
      type: "article" as const,
      path: page.path,
      pageTree: await articleSource.serializePageTree(
        articleSource.getPageTree(),
      ),
    };
  });

const clientLoader = browserCollections.articles.createClientLoader({
  component({ toc, frontmatter, default: MDX }) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody>
          <MDX components={getMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const data = Route.useLoaderData();

  if (data.type === "index") {
    return <ArticlesIndex articles={data.articles} />;
  }

  return <ArticlePage data={data} />;
}

function ArticlesIndex({
  articles,
}: {
  articles: {
    title: string;
    description?: string;
    url: string;
  }[];
}) {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-1 flex-col">
        <section className="px-6 py-20">
          <div className="mx-auto flex max-w-4xl flex-col gap-10">
            <div className="flex max-w-2xl flex-col gap-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-fd-primary">
                Articles
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight text-fd-foreground sm:text-5xl">
                Practical guides for going from web to mobile
              </h1>
              <p className="text-base leading-relaxed text-fd-muted-foreground">
                Concrete workflows for turning web apps into iOS and Android
                apps with Capacitor, without losing the habits of web
                development.
              </p>
            </div>

            <div className="grid gap-4">
              {articles.map((article) => (
                <a
                  key={article.url}
                  href={article.url}
                  className="group rounded-lg border border-fd-border bg-fd-card p-5 transition-colors hover:border-fd-primary/40"
                >
                  <h2 className="text-xl font-semibold text-fd-foreground group-hover:text-fd-primary">
                    {article.title}
                  </h2>
                  {article.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
                      {article.description}
                    </p>
                  ) : null}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </HomeLayout>
  );
}

function ArticlePage({
  data,
}: {
  data: Extract<ReturnType<typeof Route.useLoaderData>, { type: "article" }>;
}) {
  const { path, pageTree } = useFumadocsLoader(data);

  return (
    <DocsLayout {...baseOptions()} tree={pageTree} sidebar={{ enabled: false }}>
      <Suspense>{clientLoader.useContent(path)}</Suspense>
    </DocsLayout>
  );
}
