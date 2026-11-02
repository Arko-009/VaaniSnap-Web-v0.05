import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
    host: true
  },
  plugins: [
    {
      name: "apk-mime-middleware",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.toLowerCase().includes(".apk")) {
            const rawName = req.url.split("/").pop().split("?")[0] || "BaaniSnap-LiveTranslatorV.0.05.apk";
            const fileName = decodeURIComponent(rawName);
            res.setHeader("Content-Type", "application/vnd.android.package-archive");
            res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.toLowerCase().includes(".apk")) {
            const rawName = req.url.split("/").pop().split("?")[0] || "BaaniSnap-LiveTranslatorV.0.05.apk";
            const fileName = decodeURIComponent(rawName);
            res.setHeader("Content-Type", "application/vnd.android.package-archive");
            res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
          }
          next();
        });
      }
    }
  ]
});
