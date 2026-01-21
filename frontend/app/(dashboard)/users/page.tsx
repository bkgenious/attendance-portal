"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Search, Users, ShieldCheck, Shield, UserCog, MoreHorizontal, Activity } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddUserDialog } from "@/components/users/add-user-dialog"
import { UserActivityModal } from "@/components/users/user-activity-modal"
import { ApiClient } from "@/lib/api"
import { Plus } from "lucide-react"

export default function UsersPage() {
    const [users, setUsers] = React.useState<any[]>([])
    const [search, setSearch] = React.useState("")
    const [roleFilter, setRoleFilter] = React.useState("ALL")
    const [loading, setLoading] = React.useState(true)

    // Activity Modal State
    const [activityOpen, setActivityOpen] = React.useState(false)
    const [selectedUserForActivity, setSelectedUserForActivity] = React.useState<{ id: string, name: string } | null>(null)
    const [activityLogs, setActivityLogs] = React.useState([])
    const [activityLoading, setActivityLoading] = React.useState(false)

    // Add User Modal State
    const [addUserOpen, setAddUserOpen] = React.useState(false)

    React.useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers()
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    const fetchUsers = () => {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) return

        const query = new URLSearchParams({
            limit: '100',
            ...(search && { search })
        })

        fetch(`http://localhost:3001/api/users?${query}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.data) setUsers(data.data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }

    const handleViewActivity = async (user: any) => {
        const name = `${user.employeeProfile?.firstName || 'User'} ${user.employeeProfile?.lastName || ''}`
        setSelectedUserForActivity({ id: user.id, name })
        setActivityOpen(true)
        setActivityLoading(true)

        try {
            const logs = await ApiClient.get(`/admin/users/${user.id}/activity`)
            setActivityLogs(logs as any)
        } catch (e) {
            toast.error("Failed to fetch activity")
        } finally {
            setActivityLoading(false)
        }
    }

    const handleUpdate = async (id: string, field: 'role' | 'isActive', value: any) => {
        const token = localStorage.getItem("token")
        // Optimistic update
        setUsers(users.map(u => u.id === id ? { ...u, [field]: value } : u))

        try {
            const res = await fetch(`http://localhost:3001/api/users/${id}`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ [field]: value })
            })
            if (!res.ok) throw new Error("Update failed")
            toast.success("User updated")
        } catch (e) {
            toast.error("Failed to update user")
            fetchUsers() // Revert on error
        }
    }

    // Client-side filtering for tabs (since backend only does search)
    const filteredUsers = users.filter(user => {
        if (roleFilter === 'ALL') return true
        return user.role === roleFilter
    })

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U'
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20'
            case 'SYSTEM_ADMIN': return 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
            case 'HR': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20'
            default: return 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10'
        }
    }

    return (
        <div className="space-y-6 max-w-[1600px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-600">
                        User Directory
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage system access and employee roles</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setAddUserOpen(true)} className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                        {['ALL', 'EMPLOYEE', 'HR', 'SUPER_ADMIN'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${roleFilter === role
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {role === 'SUPER_ADMIN' ? 'ADMINS' : role}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-xl bg-white/5 backdrop-blur-xl border-t border-white/10">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Users className="h-5 w-5 text-violet-400" />
                            All Users
                            <span className="text-xs font-normal text-muted-foreground ml-2 bg-white/5 px-2 py-0.5 rounded-full">
                                {filteredUsers.length} total
                            </span>
                        </CardTitle>
                        <div className="relative w-[250px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-8 bg-black/20 border-white/10 focus:border-violet-500/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">User</TableHead>
                                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Role</TableHead>
                                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Status</TableHead>
                                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-white/10">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} />
                                                <AvatarFallback className="bg-violet-500/20 text-violet-200">
                                                    {getInitials(user.employeeProfile?.firstName, user.employeeProfile?.lastName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white group-hover:text-violet-200 transition-colors">
                                                    {user.employeeProfile?.firstName} {user.employeeProfile?.lastName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Select value={user.role} onValueChange={(v) => handleUpdate(user.id, 'role', v)}>
                                                <SelectTrigger className="w-[130px] h-8 bg-transparent border-white/10 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                                                    <SelectItem value="HR">HR Manager</SelectItem>
                                                    <SelectItem value="SYSTEM_ADMIN">Sys Admin</SelectItem>
                                                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                                {user.role}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleUpdate(user.id, 'isActive', !user.isActive)}
                                            className={`h-6 text-xs font-medium px-2.5 rounded-full border transition-all ${user.isActive
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                                }`}
                                        >
                                            {user.isActive ? "Active" : "Inactive"}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleViewActivity(user)}>
                                                    <Activity className="mr-2 h-4 w-4" />
                                                    View Activity
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-500" onClick={() => handleUpdate(user.id, 'isActive', !user.isActive)}>
                                                    {user.isActive ? 'Deactivate User' : 'Activate User'}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>


            <UserActivityModal
                isOpen={activityOpen}
                onClose={() => setActivityOpen(false)}
                user={selectedUserForActivity}
                activity={activityLogs}
                loading={activityLoading}
            />

            <AddUserDialog
                isOpen={addUserOpen}
                onClose={() => setAddUserOpen(false)}
                onUserCreated={fetchUsers}
            />
        </div >
    )
}
