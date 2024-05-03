import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "dndrxjs",
  description: "low level drag & drop library based on rxjs",
  srcDir: "./docs/",
  base: "/dndrxjs/",
  themeConfig: {
    logo: "/logo-small.svg",

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/installation" },
    ],

    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Installation", link: "/installation" },
          { text: "Types", link: "/types" },
        ],
      },
      {
        text: "Examples",
        items: [
          { text: "Horizontal List", link: "/horizontal-list" },
          { text: "Tree", link: "/tree" },
          { text: "Grid", link: "/grid" },
          { text: "Multiple Lists", link: "/multiple-lists" },
          { text: "Vertical List", link: "/vertical-list" },
          { text: "Auto-Scroll", link: "/auto-scroll" },
          // { text: "Ghost Image", link: "/ghost-image" },
          // { text: "Custom Drag Image", link: "/drag-image" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/yff111/dndrxjs/" },
    ],
  },
})
