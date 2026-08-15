const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
})

export function formatDateLabel(value: string) {
    if (!value) {
        return ""
    }

    const date = new Date(`${value}T00:00:00`)
    if (Number.isNaN(date.getTime())) {
        return value
    }

    return dateFormatter.format(date)
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
