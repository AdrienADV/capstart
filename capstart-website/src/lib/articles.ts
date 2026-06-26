import { articles } from "collections/server";
import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { articlesRoute } from "./shared";

export const articleSource = loader({
  source: articles.toFumadocsSource(),
  baseUrl: articlesRoute,
  plugins: [lucideIconsPlugin()],
});
