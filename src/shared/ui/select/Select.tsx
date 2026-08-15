import { Label, ListBox, Select as HeroSelect } from "@heroui/react"

export type SelectOption = {
    id: string
    label: string
}

type SelectProps = {
    label: string
    options: SelectOption[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    emptyOption?: SelectOption
    variant?: "primary" | "secondary"
}

export function Select({
    label,
    options,
    value,
    onChange,
    placeholder,
    emptyOption,
    variant = "primary",
}: SelectProps) {
    return (
        <HeroSelect
            fullWidth
            variant={variant}
            placeholder={placeholder}
            value={value || emptyOption?.id || null}
            onChange={next => onChange(fromValue(next, emptyOption?.id))}>
            <Label>{label}</Label>
            <HeroSelect.Trigger>
                <HeroSelect.Value />
                <HeroSelect.Indicator />
            </HeroSelect.Trigger>
            <HeroSelect.Popover>
                <ListBox>
                    {emptyOption ? (
                        <ListBox.Item
                            id={emptyOption.id}
                            textValue={emptyOption.label}>
                            {emptyOption.label}
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    ) : null}
                    {options.map(option => (
                        <ListBox.Item
                            key={option.id}
                            id={option.id}
                            textValue={option.label}>
                            {option.label}
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    ))}
                </ListBox>
            </HeroSelect.Popover>
        </HeroSelect>
    )
}

function fromValue(value: unknown, emptyId?: string): string {
    if (value == null) {
        return ""
    }

    const next = String(value)
    return next === emptyId ? "" : next
}
