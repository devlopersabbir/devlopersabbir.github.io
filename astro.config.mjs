// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: "https://devlopersabbir.github.io",
  // integrations: [sitemap(), mdx(), assets()],
  integrations: [mdx(), sitemap()],
});
