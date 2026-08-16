import {
    createRootRoute,
    createRoute,
    createRouter,
} from "@tanstack/react-router"

import { RootLayout } from "@/app/layout"
import { CsvPage } from "@/pages/csv"
import { HomePage } from "@/pages/home"
import { AuthCallbackPage, ZenMoneyPage } from "@/pages/zenmoney"

const rootRoute = createRootRoute({
    component: RootLayout,
})

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomePage,
})

const csvRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/csv",
    component: CsvPage,
})

const zenmoneyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/zenmoney",
    component: ZenMoneyPage,
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

const routeTree = rootRoute.addChildren([
    indexRoute,
    csvRoute,
    zenmoneyRoute,
    authCallbackRoute,
])

export const router = createRouter({
    routeTree,
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
