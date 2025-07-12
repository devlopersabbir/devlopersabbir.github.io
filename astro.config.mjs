import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import remarkGfm from "remark-gfm";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  output: "server",

  vite: {
    plugins: [tailwindcss()],
  },

  site: "https://devlopersabbir.github.io",
  integrations: [sitemap(), mdx()],

  markdown: {
    remarkPlugins: [remarkGfm],
  },

  adapter: vercel(),
});
