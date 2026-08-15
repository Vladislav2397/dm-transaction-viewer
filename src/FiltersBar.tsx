import type { FilterOptions } from "./query"
import type { TransactionFilters } from "./transaction"

type FiltersBarProps = {
    filters: TransactionFilters
    options: FilterOptions
    onChange: (next: TransactionFilters) => void
}

export function FiltersBar({ filters, options, onChange }: FiltersBarProps) {
    const hasActive =
        filters.query !== "" ||
        filters.type !== "" ||
        filters.category !== "" ||
        filters.account !== ""

    return (
        <div className="filters">
            <label>
                Поиск
                <input
                    type="search"
                    value={filters.query}
                    placeholder="Плательщик, комментарий, счёт"
                    onChange={event =>
                        onChange({ ...filters, query: event.target.value })
                    }
                />
            </label>
            <label>
                Тип платежа
                <select
                    value={filters.type}
                    onChange={event =>
                        onChange({ ...filters, type: event.target.value })
                    }>
                    <option value="">Все типы</option>
                    {options.types.map(type => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Категория
                <select
                    value={filters.category}
                    onChange={event =>
                        onChange({ ...filters, category: event.target.value })
                    }>
                    <option value="">Все категории</option>
                    {options.categories.map(category => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Счёт
                <select
                    value={filters.account}
                    onChange={event =>
                        onChange({ ...filters, account: event.target.value })
                    }>
                    <option value="">Все счета</option>
                    {options.accounts.map(account => (
                        <option key={account} value={account}>
                            {account}
                        </option>
                    ))}
                </select>
            </label>
            {hasActive ? (
                <button
                    type="button"
                    className="ghost"
                    onClick={() =>
                        onChange({
                            query: "",
                            type: "",
                            category: "",
                            account: "",
                        })
                    }>
                    Сбросить
                </button>
            ) : null}
        </div>
    )
}
