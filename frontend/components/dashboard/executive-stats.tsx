"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Clock, CalendarOff, AlertTriangle } from "lucide-react"

interface Stats {
    presentToday: number
    lateToday: number
    onLeave: number
    absentToday: number
    totalEmployees: number
}

import { useQuery } from "@tanstack/react-query"
import { ApiClient } from "@/lib/api"

export function ExecutiveStats() {
    const { data: stats, isLoading: loading } = useQuery({
        queryKey: ["admin", "stats"],
        queryFn: async () => {
            return await ApiClient.get<Stats>("/admin/stats")
        },
        refetchInterval: 5000 // Real-time (5s)
    })

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-0 bg-white/5 animate-pulse h-24" />
                ))}
            </div>
        )
    }

    if (!stats) {
        return null
    }

    const statCards = [
        {
            label: "Present",
            value: stats.presentToday,
            icon: Users,
            color: "text-green-400",
            bg: "bg-green-500/10",
            border: "border-green-500/20"
        },
        {
            label: "Late",
            value: stats.lateToday,
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        },
        {
            label: "On Leave",
            value: stats.onLeave,
            icon: CalendarOff,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            label: "Absent",
            value: stats.absentToday,
            icon: AlertTriangle,
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20"
        }
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Today's Workforce
                </h2>
                <span className="text-xs text-muted-foreground">
                    {stats.totalEmployees} Total Staff
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
                    <Card
                        key={label}
                        className={`border ${border} ${bg} backdrop-blur-sm`}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-white">{value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{label}</p>
                                </div>
                                <Icon className={`h-8 w-8 ${color} opacity-60`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
