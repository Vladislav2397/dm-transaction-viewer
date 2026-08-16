import { useMemo } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"

import {
    parseViewSearch,
    viewToSearch,
    type ViewState,
} from "./urlState"

export function useViewSearch() {
    const search = useSearch({ strict: false })
    const navigate = useNavigate()
    const view = useMemo(
        () => parseViewSearch(search as Record<string, unknown>),
        [search],
    )

    function patchView(next: Partial<ViewState>) {
        const merged: ViewState = { ...view, ...next }
        void navigate({
            to: ".",
            search: viewToSearch(merged),
            replace: true,
        })
    }

    return { view, patchView }
}
