"use client"

import * as React from "react"
import {
    addDays,
    format,
    startOfWeek,
    endOfWeek,
    subWeeks,
    startOfMonth,
    endOfMonth,
    subMonths,
    startOfQuarter,
    endOfQuarter,
    subQuarters
} from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
    className?: string
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
    className,
    date,
    setDate,
}: DatePickerWithRangeProps) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex">
                        <div className="flex flex-col gap-2 p-3 border-r">
                            <Button
                                variant="ghost"
                                className="justify-start text-left font-normal"
                                onClick={() => {
                                    const today = new Date()
                                    setDate({
                                        from: startOfWeek(today),
                                        to: endOfWeek(today)
                                    })
                                }}
                            >
                                This Week
                            </Button>
                            <Button
                                variant="ghost"
                                className="justify-start text-left font-normal"
                                onClick={() => {
                                    const today = new Date()
                                    const lastWeek = subWeeks(today, 1)
                                    setDate({
                                        from: startOfWeek(lastWeek),
                                        to: endOfWeek(lastWeek)
                                    })
                                }}
                            >
                                Past Week
                            </Button>
                            <Button
                                variant="ghost"
                                className="justify-start text-left font-normal"
                                onClick={() => {
                                    const today = new Date()
                                    setDate({
                                        from: startOfMonth(today),
                                        to: endOfMonth(today)
                                    })
                                }}
                            >
                                This Month
                            </Button>
                            <Button
                                variant="ghost"
                                className="justify-start text-left font-normal"
                                onClick={() => {
                                    const today = new Date()
                                    const lastMonth = subMonths(today, 1)
                                    setDate({
                                        from: startOfMonth(lastMonth),
                                        to: endOfMonth(lastMonth)
                                    })
                                }}
                            >
                                Past Month
                            </Button>
                            <Button
                                variant="ghost"
                                className="justify-start text-left font-normal"
                                onClick={() => {
                                    const today = new Date()
                                    setDate({
                                        from: startOfQuarter(today),
                                        to: endOfQuarter(today)
                                    })
                                }}
                            >
                                This Quarter
                            </Button>
                            <Button
                                variant="ghost"
                                className="justify-start text-left font-normal"
                                onClick={() => {
                                    const today = new Date()
                                    const lastQuarter = subQuarters(today, 1)
                                    setDate({
                                        from: startOfQuarter(lastQuarter),
                                        to: endOfQuarter(lastQuarter)
                                    })
                                }}
                            >
                                Past Quarter
                            </Button>
                        </div>
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
