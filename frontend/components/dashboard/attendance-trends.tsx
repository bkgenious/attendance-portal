"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface TrendData {
    date: string
    present: number
}

import { useQuery } from "@tanstack/react-query"
import { ApiClient } from "@/lib/api"

export function AttendanceTrends() {
    const { data: data = [], isLoading: loading } = useQuery({
        queryKey: ["admin", "trends"],
        queryFn: async () => {
            const res = await ApiClient.get<TrendData[] | any>("/admin/trends?days=14")
            return Array.isArray(res) ? res : []
        },
        refetchInterval: 5000
    })

    if (loading) {
        return (
            <Card className="border-0 bg-white/5 backdrop-blur-xl">
                <CardContent className="p-6">
                    <div className="h-32 bg-white/10 animate-pulse rounded" />
                </CardContent>
            </Card>
        )
    }

    if (data.length === 0) {
        return null
    }

    const maxValue = Math.max(...data.map(d => d.present), 1)
    const chartHeight = 120

    return (
        <Card className="border-0 bg-white/5 backdrop-blur-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                    14-Day Attendance Trend
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end gap-1 h-32">
                    {data.map((day, i) => {
                        const height = (day.present / maxValue) * chartHeight
                        const date = new Date(day.date)
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6

                        return (
                            <div
                                key={i}
                                className="flex-1 flex flex-col items-center gap-1 group"
                            >
                                {/* Bar */}
                                <div
                                    className={`w-full rounded-t transition-all duration-300 ${isWeekend
                                        ? 'bg-white/10'
                                        : 'bg-gradient-to-t from-blue-600 to-sky-400 group-hover:from-blue-500 group-hover:to-sky-300'
                                        }`}
                                    style={{ height: `${Math.max(height, 4)}px` }}
                                    title={`${day.date}: ${day.present} present`}
                                />

                                {/* Label */}
                                <span className="text-[10px] text-muted-foreground">
                                    {date.getDate()}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Summary */}
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-muted-foreground">
                    <span>Average: {Math.round(data.reduce((a, b) => a + b.present, 0) / data.length)} /day</span>
                    <span>Peak: {maxValue} present</span>
                </div>
            </CardContent>
        </Card>
    )
}
