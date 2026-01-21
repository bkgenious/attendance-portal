"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 w-full",
                caption: "flex justify-between pt-1 relative items-center mb-2 px-2",
                caption_label: "text-base font-semibold text-white tracking-wide pl-2", // Windows style header
                nav: "flex items-center gap-1",
                nav_button: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-white/10 hover:text-white rounded-md transition-colors"
                ),
                nav_button_previous: "",
                nav_button_next: "",

                // --- FORCED GRID LAYOUT (NUCLEAR OPTION) ---
                table: "w-full border-collapse block",
                tbody: "w-full block", // Force body to be block
                head_row: "grid grid-cols-7 mb-2 w-full", // Force header row to be grid
                head_cell: "text-muted-foreground/60 rounded-md w-full font-normal text-[0.8rem] uppercase tracking-wide text-center py-2 flex items-center justify-center",

                row: "grid grid-cols-7 mt-1 w-full gap-y-1", // Force date rows to be grid
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent flex items-center justify-center",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 hover:text-white mx-auto transition-all rounded-full text-white/90" // Default text color
                ),
                day_range_end: "day-range-end",

                // --- WINDOWS 11 STYLE SELECTION ---
                day_selected:
                    "bg-[#3b82f6] text-white hover:bg-[#2563eb] focus:bg-[#2563eb] rounded-full shadow-md shadow-blue-500/20 font-medium", // Accurate Blue

                day_today: "bg-transparent text-[#3b82f6] font-bold border border-[#3b82f6] rounded-full", // Outlined Today

                day_outside:
                    "text-muted-foreground/20 opacity-40 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-20",
                day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                ...classNames,
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
