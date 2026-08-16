import {
    createRootRoute,
    createRoute,
    createRouter,
} from "@tanstack/react-router"

import { RootLayout } from "@/app/layout"
import { HomePage } from "@/pages/home"
import { AuthCallbackPage } from "@/pages/zenmoney"

const rootRoute = createRootRoute({
    component: RootLayout,
})

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomePage,
})

const authCallbackRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/callback",
    component: AuthCallbackPage,
    validateSearch: (search: Record<string, unknown>) => ({
        code: stringParam(search.code),
        state: stringParam(search.state),
        error: stringParam(search.error),
    }),
})

const routeTree = rootRoute.addChildren([indexRoute, authCallbackRoute])

export const router = createRouter({
    routeTree,
    basepath: import.meta.env.BASE_URL.replace(/\/$/, ""),
    defaultPreload: "intent",
})

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router
    }
}

function stringParam(value: unknown) {
    return typeof value === "string" ? value : undefined
}
