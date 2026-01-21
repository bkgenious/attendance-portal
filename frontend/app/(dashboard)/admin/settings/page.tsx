"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ApiClient } from "@/lib/api"
import { toast } from "sonner"
import { Save, Settings } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        ApiClient.get("/settings")
            .then(setSettings)
            .catch(() => toast.error("Failed to load settings"))
            .finally(() => setLoading(false))
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const updated = await ApiClient.patch("/settings", settings)
            setSettings(updated)
            toast.success("Settings updated successfully")
        } catch (error) {
            toast.error("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-48" />
                <Card className="bg-card text-card-foreground">
                    <CardHeader><Skeleton className="h-8 w-32" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">System Configuration</h1>
                <p className="text-muted-foreground">Manage global application settings.</p>
            </div>

            <Card className="shadow-lg bg-card text-card-foreground border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        General Settings
                    </CardTitle>
                    <CardDescription>Configure core system parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-foreground">Company Name</Label>
                            <Input
                                value={settings?.companyName || ''}
                                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                                className="bg-background border-input text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">Currency</Label>
                            <Input
                                value={settings?.currency || ''}
                                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                className="bg-background border-input text-foreground"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-foreground">Work Start Time</Label>
                            <Input
                                type="time"
                                value={settings?.workStartTime || ''}
                                onChange={(e) => setSettings({ ...settings, workStartTime: e.target.value })}
                                className="bg-background border-input text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">Work End Time</Label>
                            <Input
                                type="time"
                                value={settings?.workEndTime || ''}
                                onChange={(e) => setSettings({ ...settings, workEndTime: e.target.value })}
                                className="bg-background border-input text-foreground"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-foreground">Late Threshold (Minutes)</Label>
                            <Input
                                type="number"
                                value={settings?.lateThreshold || ''}
                                onChange={(e) => setSettings({ ...settings, lateThreshold: parseInt(e.target.value) })}
                                className="bg-background border-input text-foreground"
                            />
                            <p className="text-xs text-muted-foreground">Grace period before marking as Late</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">Half Day Threshold (Hours)</Label>
                            <Input
                                type="number"
                                value={settings?.halfDayThreshold || ''}
                                onChange={(e) => setSettings({ ...settings, halfDayThreshold: parseInt(e.target.value) })}
                                className="bg-background border-input text-foreground"
                            />
                            <p className="text-xs text-muted-foreground">Minimum hours for half-day credit</p>
                        </div>
                    </div>

                    {/* Working Days Checkboxes (Simplified as array display for now) */}
                    <div className="space-y-2">
                        <Label className="text-foreground">Working Days (Ids)</Label>
                        <div className="p-3 rounded-md bg-muted text-sm font-mono text-muted-foreground">
                            {JSON.stringify(settings?.workingDays)}
                        </div>
                        <p className="text-xs text-muted-foreground">1=Mon, 7=Sun. (UI upgrade coming soon)</p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {saving ? 'Saving...' : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
