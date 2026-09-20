import fs from "node:fs";
import path from "node:path";

import { defineConfig } from "vitepress";
import { version } from "../../package.json";

function normalizeBase(base: string): string {
  if (!base) return "/";

  const withLeadingSlash = base.startsWith("/") ? base : `/${base}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

interface SidebarItem {
  text: string;
  link: string;
}

function titleFromSlug(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function readApiItems(section: string): SidebarItem[] {
  const sectionDir = path.resolve(process.cwd(), "website", "api", section);
  if (!fs.existsSync(sectionDir)) {
    return [];
  }

  return fs
    .readdirSync(sectionDir)
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      return {
        text: titleFromSlug(slug),
        link: `/api/${section}/${slug}`,
      };
    });
}

const apiSidebar = [
  {
    text: "API Reference",
    items: [{ text: "Overview", link: "/api/" }],
  },
  {
    text: "Classes",
    collapsed: false,
    items: readApiItems("classes"),
  },
  {
    text: "Interfaces",
    collapsed: true,
    items: readApiItems("interfaces"),
  },
  {
    text: "Type Aliases",
    collapsed: true,
    items: readApiItems("type-aliases"),
  },
];

const guideSidebar = [
  {
    text: "Guide",
    items: [
      { text: "Getting Started", link: "/guide/getting-started" },
      { text: "Stations & Prices", link: "/guide/stations" },
      { text: "Complaints", link: "/guide/complaints" },
      { text: "Error Handling", link: "/guide/error-handling" },
    ],
  },
];

const base = normalizeBase(process.env.WEBSITE_BASE ?? "/");

export default defineConfig({
  title: "tankerkoenig-js",
  description: "A JavaScript API client for the Tankerkönig gas prices API.",
  base,
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "API", link: "/api/" },
      {
        text: `v${version}`,
        items: [
          {
            text: "Changelog",
            link: "https://github.com/creeperkatze/tankerkoenig-js/releases",
          },
        ],
      },
    ],
    sidebar: {
      "/guide/": guideSidebar,
      "/api/": apiSidebar,
      "/": [...guideSidebar, ...apiSidebar],
    },
    lastUpdated: {},
    editLink: {
      pattern: "https://github.com/creeperkatze/tankerkoenig-js/edit/main/website/:path",
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/creeperkatze/tankerkoenig-js" },
      { icon: "npm", link: "https://www.npmjs.com/package/tankerkoenig-js" },
    ],
    search: {
      provider: "local",
    },
  },
});
