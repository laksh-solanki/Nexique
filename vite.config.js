import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load all environment variables (like MONGODB_URI) and assign to process.env for local API usage
  const env = loadEnv(mode, process.cwd(), "");
  for (let [key, value] of Object.entries(env)) {
    if (key.startsWith("\uFEFF")) {
      key = key.slice(1);
    }
    process.env[key] = value;
  }

  return {
    plugins: [
      vue(),
      tailwindcss(),
      {
        name: "api-server-middleware",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith("/api")) {
              try {
                // SSR load the API router module so it resolves ES imports and hot-reloads
                const { default: handler } = await server.ssrLoadModule("/api/index.js");
                await handler(req, res);
              } catch (err) {
                console.error("Local API Server Error:", err);
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Local API server error: " + err.message }));
              }
              return;
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
