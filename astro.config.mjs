import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import remarkGfm from "remark-gfm";
// import vercel from "@astrojs/vercel";
import node from "@astrojs/node";
import react from "@astrojs/react";
import vercelServerless from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  output: "server",

  vite: {
    plugins: [tailwindcss()],
  },

  site: "https://devlopersabbir.github.io",
  integrations: [sitemap(), mdx(), react()],

  markdown: {
    remarkPlugins: [remarkGfm],
  },

  adapter: vercelServerless({
    webAnalytics: {
      enabled: true,
    },
    maxDuration: 8,
  }),
});
