import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "dnd-rxjs-ts",
  description: "low level drag & drop library based on rxjs",
  base: "/dnd-rxjs-ts/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/getting-started" },
    ],

    sidebar: [
      { text: "Getting Started", link: "/getting-started" },
      {
        text: "Examples",
        items: [
          { text: "List", link: "/vertical-list" },
          { text: "Tree", link: "/tree" },
          { text: "Grid", link: "/grid" },
          { text: "Horizontal List", link: "/horizontal-list" },
          // { text: "Ghost Image", link: "/ghost-image" },
          // { text: "Custom Drag Image", link: "/drag-image" },
          { text: "Auto-Scroll", link: "/auto-scroll" },
          { text: "Multiple Lists", link: "/multiple-lists" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/yff111/dnd-rxjs-ts/" },
    ],
  },
})
