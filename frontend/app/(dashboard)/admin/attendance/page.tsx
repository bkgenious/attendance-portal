"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Save, Search, User, Filter, RefreshCcw, CheckSquare, Square, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ApiClient } from "@/lib/api"
import { Checkbox } from "@/components/ui/checkbox"

interface DailyRecord {
    user: {
        id: string;
        email: string;
        employeeProfile: {
            firstName: string;
            lastName: string;
            department: string | null;
            designation: string | null;
            employeeId: string | null;
        } | null;
    };
    attendance: {
        id: string;
        status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';
        checkIn: string | null;
        checkOut: string | null;
    } | null;
    // UI state
    isSelected?: boolean;
}

export default function AttendanceManagementPage() {
    const [date, setDate] = useState<Date>(new Date())
    const [records, setRecords] = useState<DailyRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")

    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    const fetchData = async () => {
        setLoading(true)
        try {
            const dateStr = format(date, 'yyyy-MM-dd')
            const data = await ApiClient.get<DailyRecord[]>(`/admin/attendance/daily-status?date=${dateStr}`)
            setRecords(data)
            setSelectedIds(new Set()) // Reset selection on new data
        } catch (error: any) {
            toast.error("Failed to fetch attendance", { description: error.message })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [date])

    // Handlers
    const toggleSelection = (userId: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(userId)) {
            newSet.delete(userId)
        } else {
            newSet.add(userId)
        }
        setSelectedIds(newSet)
    }

    const toggleAll = () => {
        if (selectedIds.size === filteredRecords.length && filteredRecords.length > 0) {
            setSelectedIds(new Set())
        } else {
            const newSet = new Set<string>()
            filteredRecords.forEach(r => newSet.add(r.user.id))
            setSelectedIds(newSet)
        }
    }

    const handleBulkUpdate = async (status: string) => {
        if (selectedIds.size === 0) return

        try {
            const updates = Array.from(selectedIds).map(userId => ({
                userId,
                status
            }))

            await ApiClient.post('/admin/attendance/bulk', {
                date: format(date, 'yyyy-MM-dd'),
                updates
            })

            toast.success("Bulk Update Successful", {
                description: `Updated ${updates.length} records to ${status}`
            })
            fetchData()
        } catch (error: any) {
            toast.error("Update Failed", { description: error.message })
        }
    }

    const handleSingleUpdate = async (userId: string, status: string) => {
        try {
            await ApiClient.post('/admin/attendance/bulk', {
                date: format(date, 'yyyy-MM-dd'),
                updates: [{ userId, status }]
            })
            // Optimistic update
            setRecords(prev => prev.map(r =>
                r.user.id === userId
                    ? { ...r, attendance: { ...r.attendance!, status: status as any } }
                    : r
            ))
            toast.success("Updated Status")
        } catch (error: any) {
            toast.error("Update Failed", { description: error.message })
            fetchData() // Revert on fail
        }
    }

    // Filtering
    const filteredRecords = records.filter(record => {
        const name = `${record.user.employeeProfile?.firstName} ${record.user.employeeProfile?.lastName}`.toLowerCase()
        const email = record.user.email.toLowerCase()
        const matchesSearch = name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase())

        let matchesStatus = true
        if (statusFilter !== 'ALL') {
            if (statusFilter === 'PENDING') {
                matchesStatus = !record.attendance
            } else {
                matchesStatus = record.attendance?.status === statusFilter
            }
        }

        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (status?: string | null) => {
        if (!status) return <Badge variant="outline" className="text-muted-foreground">Not Marked</Badge>

        switch (status) {
            case 'PRESENT': return <Badge className="bg-green-500 hover:bg-green-600">Present</Badge>
            case 'ABSENT': return <Badge variant="destructive">Absent</Badge>
            case 'LATE': return <Badge className="bg-yellow-500 hover:bg-yellow-600">Late</Badge>
            case 'HALF_DAY': return <Badge className="bg-orange-500 hover:bg-orange-600">Half Day</Badge>
            case 'ON_LEAVE': return <Badge className="bg-blue-500 hover:bg-blue-600">On Leave</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Daily Attendance</h1>
                    <p className="text-muted-foreground">Overview and bulk operations.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="icon" onClick={fetchData}>
                        <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <Card className="border-0 shadow-sm bg-card">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-[300px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search employees..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="PRESENT">Present</SelectItem>
                                <SelectItem value="ABSENT">Absent</SelectItem>
                                <SelectItem value="LATE">Late</SelectItem>
                                <SelectItem value="PENDING">Not Marked</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-right-5 fade-in">
                            <span className="text-sm font-medium text-muted-foreground mr-2">
                                {selectedIds.size} selected
                            </span>
                            <Button size="sm" onClick={() => handleBulkUpdate('PRESENT')} className="bg-green-600 hover:bg-green-700 text-white">
                                Mark Present
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleBulkUpdate('ABSENT')}>
                                Mark Absent
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedIds.size === filteredRecords.length && filteredRecords.length > 0}
                                    onCheckedChange={toggleAll}
                                />
                            </TableHead>
                            <TableHead>Employee</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Check In</TableHead>
                            <TableHead>Check Out</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : filteredRecords.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">No employees found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredRecords.map((record) => (
                                <TableRow key={record.user.id} className={cn(selectedIds.has(record.user.id) ? "bg-muted/50" : "")}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(record.user.id)}
                                            onCheckedChange={() => toggleSelection(record.user.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-foreground">{record.user.employeeProfile?.firstName} {record.user.employeeProfile?.lastName}</p>
                                            <p className="text-xs text-muted-foreground">{record.user.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{record.user.employeeProfile?.department || 'N/A'}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-xs">{record.attendance?.checkIn ? new Date(record.attendance.checkIn).toLocaleTimeString() : '-'}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-xs">{record.attendance?.checkOut ? new Date(record.attendance.checkOut).toLocaleTimeString() : '-'}</span>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(record.attendance?.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Select
                                            defaultValue={record.attendance?.status || 'PENDING'}
                                            onValueChange={(val) => handleSingleUpdate(record.user.id, val)}
                                        >
                                            <SelectTrigger className="w-[110px] h-8 text-xs ml-auto">
                                                <SelectValue placeholder="Update" />
                                            </SelectTrigger>
                                            <SelectContent align="end">
                                                <SelectItem value="PRESENT">Present</SelectItem>
                                                <SelectItem value="ABSENT">Absent</SelectItem>
                                                <SelectItem value="LATE">Late</SelectItem>
                                                <SelectItem value="HALF_DAY">Half Day</SelectItem>
                                                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
