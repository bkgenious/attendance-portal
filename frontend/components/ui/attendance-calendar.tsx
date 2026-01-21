"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface AttendanceCalendarProps {
    year: number
    month: number // 0-based (0 = January)
    attendanceMap?: Record<string, "present" | "absent" | "leave">
    selectedDate?: Date
    onSelectDate?: (date: Date) => void
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay()
}

function formatDateKey(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function AttendanceCalendar({
    year,
    month,
    attendanceMap = {},
    selectedDate,
    onSelectDate,
}: AttendanceCalendarProps) {
    const [currentYear, setCurrentYear] = React.useState(year)
    const [currentMonth, setCurrentMonth] = React.useState(month)

    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)
    const today = new Date()

    const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11)
            setCurrentYear(currentYear - 1)
        } else {
            setCurrentMonth(currentMonth - 1)
        }
    }

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0)
            setCurrentYear(currentYear + 1)
        } else {
            setCurrentMonth(currentMonth + 1)
        }
    }

    const handleDateClick = (day: number) => {
        if (onSelectDate) {
            onSelectDate(new Date(currentYear, currentMonth, day))
        }
    }

    const isToday = (day: number) => {
        return (
            today.getDate() === day &&
            today.getMonth() === currentMonth &&
            today.getFullYear() === currentYear
        )
    }

    const isSelected = (day: number) => {
        if (!selectedDate) return false
        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth &&
            selectedDate.getFullYear() === currentYear
        )
    }

    // Generate cells: leading empty + days
    const calendarCells: (number | null)[] = []
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarCells.push(null) // Empty leading cells
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarCells.push(day)
    }

    return (
        <div className="w-full bg-[#1e1e1e] rounded-xl border border-white/10 shadow-2xl overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#252525] border-b border-white/5">
                <span className="text-sm font-semibold text-white/90">Attendance Calendar</span>
                <div className="h-2 w-2 rounded-full bg-[#3b82f6] animate-pulse"></div>
            </div>

            {/* MONTH NAVIGATION */}
            <div className="flex items-center justify-between px-4 py-4">
                <button
                    onClick={handlePrevMonth}
                    className="h-8 w-8 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    aria-label="Previous Month"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-base font-semibold text-white tracking-wide">
                    {monthName} {currentYear}
                </span>
                <button
                    onClick={handleNextMonth}
                    className="h-8 w-8 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    aria-label="Next Month"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* WEEKDAY HEADER ROW - STRICT 7 COL GRID */}
            <div className="grid grid-cols-7 px-4 pb-2">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground/60 py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* CALENDAR GRID - STRICT 7 COL GRID */}
            <div className="grid grid-cols-7 gap-1 px-4 pb-4">
                {calendarCells.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="aspect-square"></div>
                    }

                    const dateKey = formatDateKey(currentYear, currentMonth, day)
                    const status = attendanceMap[dateKey]
                    const selected = isSelected(day)
                    const todayHighlight = isToday(day)

                    return (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={cn(
                                "aspect-square flex flex-col items-center justify-center rounded-full text-sm font-medium transition-all relative",
                                "hover:bg-white/10 hover:text-white",
                                selected && "bg-[#3b82f6] text-white shadow-md shadow-blue-500/30",
                                todayHighlight && !selected && "border border-[#3b82f6] text-[#3b82f6]",
                                !selected && !todayHighlight && "text-white/80"
                            )}
                        >
                            {day}
                            {/* Status Indicator Dot */}
                            {status && (
                                <span
                                    className={cn(
                                        "absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full",
                                        status === "present" && "bg-green-500",
                                        status === "absent" && "bg-rose-500",
                                        status === "leave" && "bg-amber-500"
                                    )}
                                />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* LEGEND */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-white/5 text-xs text-muted-foreground/60">
                <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500"></div>
                    <span>Absent</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                    <span>Leave</span>
                </div>
            </div>
        </div>
    )
}
