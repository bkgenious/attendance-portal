"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, CalendarCheck, Clock, User, LogOut, Users, Briefcase, Shield, Settings, Calendar, Laptop, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"

const sidebarSections = [
    {
        title: "Personal",
        items: [
            {
                title: "Dashboard",
                href: "/dashboard",
                icon: LayoutDashboard,
            },
            {
                title: "Attendance",
                href: "/attendance",
                icon: Clock,
            },
            {
                title: "Leaves",
                href: "/leaves",
                icon: CalendarCheck,
            },
            {
                title: "Profile",
                href: "/profile",
                icon: User,
            },
        ]
    },
    {
        title: "Management",
        items: [
            {
                title: "Users",
                href: "/users",
                icon: Users,
            },
            {
                title: "HR Portal",
                href: "/hr",
                icon: Briefcase,
                showBadge: true, // Will show pending count
            },
        ]
    },
    {
        title: "Administration",
        items: [
            {
                title: "Admin Portal",
                href: "/admin",
                icon: Shield,
            },
            {
                title: "Manage Attendance",
                href: "/admin/attendance",
                icon: CalendarCheck,
            },
            {
                title: "Manage Holidays",
                href: "/admin/holidays",
                icon: Calendar,
            },
            {
                title: "Active Sessions",
                href: "/admin/sessions",
                icon: Laptop,
            },
            {
                title: "Reports",
                href: "/admin/reports",
                icon: FileText,
            },
            {
                title: "Settings",
                href: "/admin/settings",
                icon: Settings,
            },
        ]
    }
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [pendingCount, setPendingCount] = React.useState(0)

    // Fetch pending approvals count
    React.useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) return

        fetch("http://localhost:3001/api/admin/pending-approvals?limit=1", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.count) setPendingCount(data.count)
            })
            .catch(() => { })
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("token")
        router.push("/login")
    }

    return (
        <div className="flex h-screen w-64 flex-col border-r border-border bg-card text-card-foreground transition-all duration-300">
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-blue-500/20">
                        <LayoutDashboard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <span className="block text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
                            Vedlinks
                        </span>
                        <span className="block text-xs text-muted-foreground tracking-widest uppercase">
                            Portal
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
                {sidebarSections.map((section) => (
                    <div key={section.title}>
                        <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider">
                            {section.title}
                        </h3>
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                                        pathname === item.href
                                            ? "bg-primary/10 text-primary shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "h-4 w-4 transition-colors",
                                        pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                    )} />
                                    <span className="flex-1">{item.title}</span>
                                    {(item as any).showBadge && pendingCount > 0 && (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black px-1">
                                            {pendingCount > 99 ? '99+' : pendingCount}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-border flex items-center justify-between gap-2">
                <Button
                    variant="ghost"
                    className="flex-1 justify-start gap-3 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
                <ModeToggle />
            </div>
        </div>
    )
}
