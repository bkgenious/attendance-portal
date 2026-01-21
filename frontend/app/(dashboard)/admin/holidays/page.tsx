"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Plus, Trash2, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as DatePicker } from "@/components/ui/calendar"

interface Holiday {
    id: string
    date: string
    name: string
    description?: string
    isOptional: boolean
}

export default function HolidayManagementPage() {
    const [holidays, setHolidays] = useState<Holiday[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)

    // Form Stats
    const [newName, setNewName] = useState("")
    const [newDate, setNewDate] = useState<Date | undefined>(new Date())
    const [newOptional, setNewOptional] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const fetchHolidays = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch('http://localhost:3001/api/holidays', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setHolidays(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHolidays()
    }, [])

    const handleCreate = async () => {
        if (!newName || !newDate) return

        setSubmitting(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch('http://localhost:3001/api/holidays', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newName,
                    date: newDate.toISOString(),
                    isOptional: newOptional
                })
            })

            if (res.ok) {
                toast.success("Holiday Added")
                setIsAddOpen(false)
                setNewName("")
                setNewOptional(false)
                fetchHolidays()
            } else {
                throw new Error("Failed to create")
            }
        } catch (error) {
            toast.error("Error", { description: "Failed to add holiday" })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this holiday?")) return

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`http://localhost:3001/api/holidays/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                toast.success("Holiday Deleted")
                setHolidays(prev => prev.filter(h => h.id !== id))
            }
        } catch (error) {
            toast.error("Error", { description: "Failed to delete" })
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Holiday Calendar</h1>
                    <p className="text-slate-400">Manage company holidays and optional leaves.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Holiday
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle>Add New Holiday</DialogTitle>
                            <DialogDescription>Create a new holiday entry for the company calendar.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Holiday Name</Label>
                                <Input
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. Independence Day"
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white",
                                                !newDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newDate ? format(newDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-slate-900 border-white/10 text-white">
                                        <DatePicker
                                            mode="single"
                                            selected={newDate}
                                            onSelect={setNewDate}
                                            initialFocus
                                            className="bg-slate-900 text-white"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="optional"
                                    checked={newOptional}
                                    onCheckedChange={(c) => setNewOptional(!!c)}
                                    className="border-white/20 data-[state=checked]:bg-blue-600"
                                />
                                <Label htmlFor="optional">Is Optional / Restricted Holiday?</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="text-slate-400">Cancel</Button>
                            <Button onClick={handleCreate} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                                {submitting ? "Adding..." : "Add Holiday"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-0 bg-white/5 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-white">Upcoming Holidays</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-white">Loading...</div>
                    ) : (
                        <div className="space-y-4">
                            {holidays.length === 0 ? (
                                <p className="text-slate-400">No holidays found.</p>
                            ) : (
                                holidays.map(holiday => (
                                    <div key={holiday.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{holiday.name}</h3>
                                                <p className="text-sm text-slate-400">
                                                    {format(new Date(holiday.date), "EEEE, MMMM do, yyyy")}
                                                    {holiday.isOptional && <span className="ml-2 text-amber-400 text-xs bg-amber-400/10 px-2 py-0.5 rounded">Optional</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={() => handleDelete(holiday.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
