import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import remarkGfm from "remark-gfm";
import react from "@astrojs/react";
import deno from "@deno/astro-adapter";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    build: {
      ssr: true,
      rollupOptions: {
        external: [], // <-- empty array means no external deps
      },
      ssr: {
        noExternal: true, // <-- bundle all dependencies, no externals
      },
    },
  },
  site: "https://devlopersabbir.github.io",
  integrations: [sitemap(), mdx(), react()],
  markdown: {
    remarkPlugins: [remarkGfm],
  },
  output: "server",
  adapter: deno(),
});
