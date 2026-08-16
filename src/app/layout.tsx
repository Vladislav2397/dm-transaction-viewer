import { Link, Outlet } from "@tanstack/react-router"

import { ThemeSwitcher } from "@/shared/ui/theme-switcher"

import "@/app/styles/App.css"

export function RootLayout() {
    return (
        <>
            <nav className="app-nav">
                <Link
                    to="/"
                    className="app-nav-link"
                    activeProps={{ className: "app-nav-link is-active" }}
                    activeOptions={{ exact: true }}>
                    Обзор
                </Link>
                <Link
                    to="/csv"
                    className="app-nav-link"
                    activeProps={{ className: "app-nav-link is-active" }}>
                    CSV
                </Link>
                <Link
                    to="/zenmoney"
                    className="app-nav-link"
                    activeProps={{ className: "app-nav-link is-active" }}>
                    ZenMoney
                </Link>
                <span className="app-nav-spacer" />
                <ThemeSwitcher />
            </nav>
            <Outlet />
        </>
    )
}
