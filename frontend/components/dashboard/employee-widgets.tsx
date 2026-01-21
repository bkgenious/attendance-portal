"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Clock } from "lucide-react"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ApiClient } from "@/lib/api"
import { ShiftTimer } from "./shift-timer"

export function EmployeeWidgets() {
    const queryClient = useQueryClient()

    const { data } = useQuery({
        queryKey: ["attendance", "me"],
        queryFn: async () => {
            const res = await ApiClient.get<any>("/attendance/me")
            return res
        }
    })

    const status = data?.attendance
    const config = data?.config

    const fetchStatus = () => {
        queryClient.invalidateQueries({ queryKey: ["attendance", "me"] })
    }

    const handleAction = async (action: 'check-in' | 'check-out') => {
        try {
            await ApiClient.post(`/attendance/${action}`, {})
            toast.success(`Successfully ${action}ed`)
            fetchStatus()
        } catch (e: any) {
            console.error("Action Error:", e)
            toast.error(e.message || "Failed to update status")
        }
    }

    const isCheckedIn = !!status?.checkIn && !status?.checkOut
    const hasCheckedOut = !!status?.checkOut

    return (
        <div className="space-y-6">
            {/* Today's Status Card */}
            <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Today's Status
                    </CardTitle>
                    <Clock className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-white mb-1">
                                {isCheckedIn ? (
                                    <span className="flex items-center gap-2 text-green-400">
                                        <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse"></span>
                                        PRESENT
                                    </span>
                                ) : hasCheckedOut ? (
                                    <span className="text-gray-400">COMPLETED</span>
                                ) : (
                                    <span className="flex items-center gap-2 text-red-400">
                                        <span className="h-2.5 w-2.5 rounded-full bg-red-400"></span>
                                        ABSENT
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground/80">
                                {isCheckedIn
                                    ? `In since ${new Date(status.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    : hasCheckedOut
                                        ? "Shift completed"
                                        : "No check-in recorded today"
                                }
                            </p>

                            {/* Live Timer */}
                            {isCheckedIn && config && (
                                <ShiftTimer
                                    checkInTime={status.checkIn}
                                    workStartTime={config.workStartTime}
                                    workEndTime={config.workEndTime}
                                />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="border-0 shadow-lg bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-3">
                    <Button
                        onClick={() => handleAction('check-in')}
                        disabled={isCheckedIn || hasCheckedOut}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 shadow-lg"
                    >
                        Check In
                    </Button>
                    <Button
                        onClick={() => handleAction('check-out')}
                        disabled={!isCheckedIn || hasCheckedOut}
                        variant="outline"
                        className="flex-1 border-white/10 hover:bg-white/5 hover:text-white"
                    >
                        Check Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
