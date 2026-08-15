import { Label, SearchField as HeroSearchField } from "@heroui/react"

type SearchFieldProps = {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    name?: string
    variant?: "primary" | "secondary"
}

export function SearchField({
    label,
    value,
    onChange,
    placeholder,
    name = "search",
    variant = "primary",
}: SearchFieldProps) {
    return (
        <HeroSearchField
            fullWidth
            name={name}
            variant={variant}
            value={value}
            onChange={onChange}>
            <Label>{label}</Label>
            <HeroSearchField.Group className="w-full">
                <HeroSearchField.SearchIcon />
                <HeroSearchField.Input placeholder={placeholder} />
                <HeroSearchField.ClearButton />
            </HeroSearchField.Group>
        </HeroSearchField>
    )
}
