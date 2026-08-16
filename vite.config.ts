import path from "node:path"
import { fileURLToPath } from "node:url"

import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const root = fileURLToPath(new URL(".", import.meta.url))

const zenmoneyProxy = {
    "/api/zenmoney": {
        target: "https://api.zenmoney.ru",
        changeOrigin: true,
        rewrite: (proxyPath: string) =>
            proxyPath.replace(/^\/api\/zenmoney/, ""),
    },
}

export default defineConfig({
    appType: "spa",
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(root, "src"),
        },
    },
    server: {
        proxy: zenmoneyProxy,
    },
    preview: {
        proxy: zenmoneyProxy,
    },
})
