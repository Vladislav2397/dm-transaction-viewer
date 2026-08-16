import { formatDate } from "@/shared/lib/format"

export function formatDateLabel(value: string) {
    if (!value) {
        return ""
    }

    const formatted = formatDate(value)
    return formatted === "—" ? "" : formatted
}

export function formatRangeLabel(from: string, to: string) {
    if (!from && !to) {
        return ""
    }
    if (from && to) {
        return `${formatDateLabel(from)} – ${formatDateLabel(to)}`
    }
    if (from) {
        return `с ${formatDateLabel(from)}`
    }

    return `по ${formatDateLabel(to)}`
}
