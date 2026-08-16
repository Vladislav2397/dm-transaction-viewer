const numberFormatter = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
})

const currencyFormatters = new Map<string, Intl.NumberFormat | null>()

export function formatMoney(value: number | null, currency = ""): string {
    if (value === null) {
        return "—"
    }

    const code = currency.trim().toUpperCase()
    if (!code) {
        return numberFormatter.format(value)
    }

    const formatter = getCurrencyFormatter(code)
    if (!formatter) {
        return `${numberFormatter.format(value)}\u00a0${code}`
    }

    return formatter.format(value)
}

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
})

function getCurrencyFormatter(code: string): Intl.NumberFormat | null {
    if (currencyFormatters.has(code)) {
        return currencyFormatters.get(code) ?? null
    }

    try {
        const formatter = new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })
        currencyFormatters.set(code, formatter)
        return formatter
    } catch {
        currencyFormatters.set(code, null)
        return null
    }
}

export function formatDate(value: string): string {
    if (!value) {
        return "—"
    }

    const date = new Date(`${value}T00:00:00`)
    if (Number.isNaN(date.getTime())) {
        return value
    }

    const parts = dateFormatter.formatToParts(date)
    const day = parts.find(part => part.type === "day")?.value
    const month = parts.find(part => part.type === "month")?.value
    const year = parts.find(part => part.type === "year")?.value
    if (!day || !month || !year) {
        return dateFormatter.format(date)
    }

    return `${day} ${month} ${year}`
}
