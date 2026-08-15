import type { DateValue } from "@internationalized/date"
import { parseDate } from "@internationalized/date"

export type CalendarRange = {
    start: DateValue
    end: DateValue
}

export function toCalendarRange(
    from: string,
    to: string,
): CalendarRange | null {
    const start = parseDateSafe(from)
    const end = parseDateSafe(to)

    if (start && end) {
        return { start, end }
    }
    if (start) {
        return { start, end: start }
    }
    if (end) {
        return { start: end, end }
    }

    return null
}

export function parseDateSafe(value: string) {
    if (!value) {
        return null
    }

    try {
        return parseDate(value)
    } catch {
        return null
    }
}
