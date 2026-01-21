import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import remarkGfm from "remark-gfm";
import react from "@astrojs/react";

export default defineConfig({
  vite: {
    plugins: [tailwindcss({})],
    mode: "class",
  },
  site: "https://devlopersabbir.github.io",
  integrations: [sitemap(), mdx(), react()],
  markdown: {
    remarkPlugins: [remarkGfm],
  },
});
