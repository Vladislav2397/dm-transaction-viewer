import { Label, ListBox, Select } from "@heroui/react"

export type MultiSelectOption = {
    id: string
    label: string
}

type MultiSelectProps = {
    label: string
    options: MultiSelectOption[]
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    minCount?: number
    variant?: "primary" | "secondary"
}

export function MultiSelect({
    label,
    options,
    value,
    onChange,
    placeholder,
    minCount = 0,
    variant = "primary",
}: MultiSelectProps) {
    return (
        <Select
            fullWidth
            variant={variant}
            selectionMode="multiple"
            placeholder={placeholder}
            value={value}
            onChange={next => {
                const selected = toKeys(next)
                if (selected.length < minCount) {
                    return
                }

                onChange(selected)
            }}>
            <Label>{label}</Label>
            <Select.Trigger>
                <Select.Value>
                    {() => {
                        if (value.length === 0 || value.length === options.length) {
                            return placeholder
                        }

                        return `${label} (${value.length})`
                    }}
                </Select.Value>
                <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
                <ListBox selectionMode="multiple">
                    {options.map(option => (
                        <ListBox.Item
                            key={option.id}
                            id={option.id}
                            textValue={option.label}
                            isDisabled={
                                minCount > 0 &&
                                value.length <= minCount &&
                                value.includes(option.id)
                            }>
                            {option.label}
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    ))}
                </ListBox>
            </Select.Popover>
        </Select>
    )
}

function toKeys(value: unknown): string[] {
    if (value == null) {
        return []
    }
    if (Array.isArray(value)) {
        return value.map(String)
    }

    return [String(value)]
}
