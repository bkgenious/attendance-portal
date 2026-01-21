"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { EmployeeWidgets } from "@/components/dashboard/employee-widgets"
import { HRWidgets } from "@/components/dashboard/hr-widgets"
import { AdminWidgets } from "@/components/dashboard/admin-widgets"
import { AlertsPanel } from "@/components/dashboard/alerts-panel"
import { AnnouncementBanner } from "@/components/announcement-banner"

const ExecutiveStats = dynamic(() => import("@/components/dashboard/executive-stats").then(mod => mod.ExecutiveStats), { ssr: false })
const DepartmentStats = dynamic(() => import("@/components/dashboard/department-stats").then(mod => mod.DepartmentStats), { ssr: false })
const PendingApprovals = dynamic(() => import("@/components/dashboard/pending-approvals").then(mod => mod.PendingApprovals), { ssr: false })
const AttendanceHeatmap = dynamic(() => import("@/components/dashboard/attendance-heatmap").then(mod => mod.AttendanceHeatmap), { ssr: false })
const AttendanceTrends = dynamic(() => import("@/components/dashboard/attendance-trends").then(mod => mod.AttendanceTrends), { ssr: false })
const PasswordApprovals = dynamic(() => import("@/components/dashboard/password-approvals").then(mod => mod.PasswordApprovals), { ssr: false })
const DangerZone = dynamic(() => import("@/components/dashboard/danger-zone").then(mod => mod.DangerZone), { ssr: false })

import { useUser } from "@/hooks/use-user"

export default function DashboardPage() {
    const { user, loading, isAuthenticated } = useUser()
    const router = useRouter()

    React.useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login")
        }
    }, [loading, isAuthenticated, router])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="space-y-6">
            {/* Announcements Banner */}
            <AnnouncementBanner />

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px]">
                {/* LEFT ZONE: My Work Today (Fixed Width on Large Screens) */}
                <div className="w-full lg:w-[480px] space-y-6 flex-shrink-0">

                    {/* Welcome Card & Role */}
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-sky-600 to-blue-800 backdrop-blur-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                            </svg>
                        </div>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-sky-200 tracking-wide uppercase">
                                    {['SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(user.role) ? 'Console Access' : 'Employee Portal'}
                                </CardTitle>
                                <div className="px-2 py-0.5 rounded-full bg-white/10 border border-white/5 text-[10px] uppercase font-bold text-white tracking-widest">
                                    {user.role?.replace('_', ' ')}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white mb-1">
                                {user.employeeProfile?.firstName} {user.employeeProfile?.lastName}
                            </div>
                            <p className="text-xs text-blue-200/60 font-mono">
                                Last login: {new Date().toLocaleTimeString()} • Asia/Calcutta
                            </p>
                        </CardContent>
                    </Card>

                    {/* Employee Status & Actions */}
                    <EmployeeWidgets />

                    {/* Attendance Calendar Heatmap */}
                    <AttendanceHeatmap />
                </div>

                {/* RIGHT ZONE: System Overview (Expands) */}
                <div className="flex-1 space-y-6 min-w-0">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white/80">System Oversight</h2>
                        <div className="h-px bg-white/10 flex-1 ml-4"></div>
                    </div>

                    {['SUPER_ADMIN', 'SYSTEM_ADMIN', 'CEO'].includes(user.role) && <ExecutiveStats />}

                    {['SUPER_ADMIN', 'SYSTEM_ADMIN', 'CEO'].includes(user.role) && <AttendanceTrends />}

                    {['SUPER_ADMIN', 'SYSTEM_ADMIN', 'CEO'].includes(user.role) && <AlertsPanel />}

                    {['SUPER_ADMIN', 'SYSTEM_ADMIN', 'CEO', 'HR'].includes(user.role) && <PasswordApprovals />}

                    {['SUPER_ADMIN', 'SYSTEM_ADMIN', 'CEO', 'HR'].includes(user.role) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DepartmentStats />
                            <PendingApprovals />
                        </div>
                    )}

                    {['HR', 'SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(user.role) && <HRWidgets />}

                    {['SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(user.role) && <AdminWidgets />}

                    {!['HR', 'SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(user.role) && (
                        <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-muted-foreground">
                            <p>No additional system widgets available for your role.</p>
                        </div>
                    )}
                    {['SUPER_ADMIN', 'CEO'].includes(user.role) && (
                        <div className="mt-8">
                            <DangerZone />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
