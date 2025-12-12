import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";


const plugins = [
  react({
    jsxImportSource: "react",
    babel: {
      plugins: [],
    },
  }),
  tailwindcss(),
  jsxLocPlugin(),
  vitePluginManusRuntime(),
  visualizer({
    open: false,
    gzipSize: true,
    brotliSize: true,
    filename: "dist/stats.html",
  }),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug", "console.warn"],
        passes: 2,
        ecma: 2020,
      },
      mangle: {
        toplevel: true,
        reserved: ["querystring"],
      },
      output: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          radix: Object.keys(
            JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "package.json"), "utf-8")).dependencies
          ).filter((dep) => dep.startsWith("@radix-ui")),
        },
      },
    },
    reportCompressedSize: true,
    target: "ES2020",
    cssCodeSplit: true,
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
  },
});
