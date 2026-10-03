import { version } from "../../package.json";
import { defineDocsConfig } from "./shared/docs";

export default defineDocsConfig({
  name: "tankerkoenig-js",
  description: "A JavaScript API client for the Tankerkönig gas prices API.",
  repo: "creeperkatze/tankerkoenig-js",
  version,
  guide: [
    { text: "Getting Started", link: "/guide/getting-started" },
    { text: "Stations & Prices", link: "/guide/stations" },
    { text: "Complaints", link: "/guide/complaints" },
    { text: "Error Handling", link: "/guide/error-handling" },
  ],
  api: new URL("../api", import.meta.url),
});
