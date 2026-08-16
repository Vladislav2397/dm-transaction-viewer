import { copyFileSync, existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

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
    base: "/dm-transaction-viewer/",
    plugins: [react(), tailwindcss(), githubPagesSpaFallback()],
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

function githubPagesSpaFallback(): Plugin {
    return {
        name: "github-pages-spa-fallback",
        closeBundle() {
            const index = path.resolve(root, "dist/index.html")
            if (existsSync(index)) {
                copyFileSync(index, path.resolve(root, "dist/404.html"))
            }
        },
    }
}
