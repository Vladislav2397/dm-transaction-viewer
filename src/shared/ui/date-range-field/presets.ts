import {
    endOfMonth,
    endOfWeek,
    endOfYear,
    getLocalTimeZone,
    startOfMonth,
    startOfWeek,
    startOfYear,
    today,
} from "@internationalized/date"

import type { DateRangePreset } from "./types"

const LOCALE = "ru-RU"

export const currentPeriodPresets: DateRangePreset[] = [
    {
        id: "week",
        label: "Текущая неделя",
        getRange: () => {
            const now = today(getLocalTimeZone())
            return {
                from: startOfWeek(now, LOCALE, "mon").toString(),
                to: endOfWeek(now, LOCALE, "mon").toString(),
            }
        },
    },
    {
        id: "month",
        label: "Текущий месяц",
        getRange: () => {
            const now = today(getLocalTimeZone())
            return {
                from: startOfMonth(now).toString(),
                to: endOfMonth(now).toString(),
            }
        },
    },
    {
        id: "year",
        label: "Текущий год",
        getRange: () => {
            const now = today(getLocalTimeZone())
            return {
                from: startOfYear(now).toString(),
                to: endOfYear(now).toString(),
            }
        },
    },
]
