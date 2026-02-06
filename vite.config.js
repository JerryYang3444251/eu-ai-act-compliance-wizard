import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["gfqljr-4173.csb.app", "gfqljr-5173.csb.app"], // replace with your Codesandbox host
  },
  preview: {
    allowedHosts: ["gfqljr-4173.csb.app", "gfqljr-5173.csb.app"], // replace with your Codesandbox host
  },
});
