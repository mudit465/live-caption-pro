import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "public/_redirects",
          dest: "",
        },
      ],
    }),
  ],

  // ✅ ADD THIS (VERY IMPORTANT)
  optimizeDeps: {
    include: ["react", "react-dom"],
  },

  // ✅ ADD THIS (EXTRA SAFETY)
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});