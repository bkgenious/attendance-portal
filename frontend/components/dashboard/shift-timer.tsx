"use client"

import { useEffect, useState } from "react"
import { differenceInSeconds } from "date-fns"
import { Progress } from "@/components/ui/progress"

interface ShiftTimerProps {
    checkInTime: string; // ISO String
    workStartTime: string; // "09:00"
    workEndTime: string; // "18:00"
}

export function ShiftTimer({ checkInTime, workStartTime, workEndTime }: ShiftTimerProps) {
    const [elapsed, setElapsed] = useState("00:00:00")
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState("On Track")

    useEffect(() => {
        // Calculate shift duration in seconds
        const [startH, startM] = workStartTime.split(':').map(Number)
        const [endH, endM] = workEndTime.split(':').map(Number)

        // Simple duration calculation assuming same day
        // If end < start (night shift), add 24 hours
        let durationHours = endH - startH
        let durationMinutes = endM - startM
        if (durationHours < 0) durationHours += 24

        const totalShiftSeconds = (durationHours * 3600) + (durationMinutes * 60)

        const timer = setInterval(() => {
            const now = new Date()
            const start = new Date(checkInTime)

            // Calculate elapsed time
            const diffSeconds = differenceInSeconds(now, start)

            // Format HH:MM:SS
            const h = Math.floor(diffSeconds / 3600).toString().padStart(2, '0')
            const m = Math.floor((diffSeconds % 3600) / 60).toString().padStart(2, '0')
            const s = (diffSeconds % 60).toString().padStart(2, '0')
            setElapsed(`${h}:${m}:${s}`)

            // Calculate Progress
            const currentProgress = Math.min((diffSeconds / totalShiftSeconds) * 100, 100)
            setProgress(currentProgress)

            // Status Logic
            if (currentProgress >= 100) setStatus("Shift Completed")
            else if (currentProgress >= 90) setStatus("Almost Done")
            else if (currentProgress >= 50) setStatus("Halfway There")
            else setStatus("In Progress")

        }, 1000)

        return () => clearInterval(timer)
    }, [checkInTime, workStartTime, workEndTime])

    return (
        <div className="mt-4 space-y-2">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Shift Timer</p>
                    <p className="text-2xl font-mono font-bold text-white tabular-nums tracking-widest">
                        {elapsed}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-blue-300 mb-1">{status}</p>
                    <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}
