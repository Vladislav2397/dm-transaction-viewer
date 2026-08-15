import { getLocalTimeZone, today } from "@internationalized/date"
import { Button, Input, Label, Modal, RangeCalendar } from "@heroui/react"
import { useEffect, useId, useMemo, useState } from "react"

import { formatRangeLabel } from "./format"
import { toCalendarRange, type CalendarRange } from "./parse"
import { currentPeriodPresets } from "./presets"
import type { DateRangeFieldProps, DateRangePreset } from "./types"

export function DateRangeField({
    label = "Дата",
    heading = "Период",
    placeholder = "Любые даты",
    dateFrom,
    dateTo,
    onChange,
    presets = currentPeriodPresets,
    variant = "primary",
}: DateRangeFieldProps) {
    const inputId = useId()
    const [open, setOpen] = useState(false)
    const applied = useMemo(
        () => toCalendarRange(dateFrom, dateTo),
        [dateFrom, dateTo],
    )
    const [draft, setDraft] = useState<CalendarRange | null>(applied)
    const [focusedDate, setFocusedDate] = useState(
        applied?.start ?? today(getLocalTimeZone()),
    )

    useEffect(() => {
        if (!open) {
            return
        }

        const next = toCalendarRange(dateFrom, dateTo)
        setDraft(next)
        setFocusedDate(next?.start ?? today(getLocalTimeZone()))
    }, [open, dateFrom, dateTo])

    function applyPreset(preset: DateRangePreset) {
        const next = preset.getRange()
        const range = toCalendarRange(next.from, next.to)
        if (!range) {
            return
        }

        setDraft(range)
        setFocusedDate(range.start)
    }

    function applyAndClose(range: CalendarRange | null) {
        onChange({
            dateFrom: range ? range.start.toString() : "",
            dateTo: range ? range.end.toString() : "",
        })
        setOpen(false)
    }

    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={inputId}>{label}</Label>
            <Input
                id={inputId}
                readOnly
                fullWidth
                variant={variant}
                className="cursor-pointer"
                placeholder={placeholder}
                value={formatRangeLabel(dateFrom, dateTo)}
                onClick={() => setOpen(true)}
                onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        setOpen(true)
                    }
                }}
            />
            <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
                <Modal.Container size="md">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>{heading}</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="flex flex-col gap-4">
                            {presets.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {presets.map(preset => (
                                        <Button
                                            key={preset.id}
                                            size="sm"
                                            variant="tertiary"
                                            onPress={() => applyPreset(preset)}>
                                            {preset.label}
                                        </Button>
                                    ))}
                                </div>
                            ) : null}
                            <RangeCalendar
                                aria-label={heading}
                                firstDayOfWeek="mon"
                                focusedValue={focusedDate}
                                value={draft}
                                onChange={setDraft}
                                onFocusChange={setFocusedDate}>
                                <RangeCalendar.Header>
                                    <RangeCalendar.Heading />
                                    <RangeCalendar.NavButton slot="previous" />
                                    <RangeCalendar.NavButton slot="next" />
                                </RangeCalendar.Header>
                                <RangeCalendar.Grid>
                                    <RangeCalendar.GridHeader>
                                        {day => (
                                            <RangeCalendar.HeaderCell>
                                                {day}
                                            </RangeCalendar.HeaderCell>
                                        )}
                                    </RangeCalendar.GridHeader>
                                    <RangeCalendar.GridBody>
                                        {date => (
                                            <RangeCalendar.Cell date={date} />
                                        )}
                                    </RangeCalendar.GridBody>
                                </RangeCalendar.Grid>
                            </RangeCalendar>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="tertiary"
                                onPress={() => applyAndClose(null)}>
                                Сбросить
                            </Button>
                            <Button
                                slot="close"
                                variant="secondary"
                                onPress={() => setOpen(false)}>
                                Отмена
                            </Button>
                            <Button onPress={() => applyAndClose(draft)}>
                                Применить
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </div>
    )
}
