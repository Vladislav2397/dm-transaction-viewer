export type DateIsoRange = {
    from: string
    to: string
}

export type DateRangePreset = {
    id: string
    label: string
    getRange: () => DateIsoRange
}

export type DateRangeFieldProps = {
    label?: string
    heading?: string
    placeholder?: string
    dateFrom: string
    dateTo: string
    onChange: (next: { dateFrom: string; dateTo: string }) => void
    presets?: DateRangePreset[]
    variant?: "primary" | "secondary"
}
