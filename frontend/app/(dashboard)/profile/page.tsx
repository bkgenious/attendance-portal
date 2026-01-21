"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
    Loader2, Mail, Briefcase, Calendar, Edit2, Save, X,
    Camera, Lock, Eye, EyeOff, Shield, Clock, MapPin
} from "lucide-react"

export default function ProfilePage() {
    const [user, setUser] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)
    const [editMode, setEditMode] = React.useState(false)
    const [saving, setSaving] = React.useState(false)
    const [showPasswordForm, setShowPasswordForm] = React.useState(false)

    // Editable fields
    const [formData, setFormData] = React.useState({
        firstName: "",
        lastName: "",
        phone: "",
        department: "",
        position: ""
    })

    // Password fields
    const [passwordData, setPasswordData] = React.useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })
    const [showPasswords, setShowPasswords] = React.useState(false)

    React.useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = () => {
        const token = localStorage.getItem("token")
        if (!token) return

        fetch("http://localhost:3001/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setUser(data)
                setFormData({
                    firstName: data.employeeProfile?.firstName || "",
                    lastName: data.employeeProfile?.lastName || "",
                    phone: data.employeeProfile?.phone || "",
                    department: data.employeeProfile?.department || "",
                    position: data.employeeProfile?.position || ""
                })
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }

    const handleSave = async () => {
        setSaving(true)
        const token = localStorage.getItem("token")

        try {
            const res = await fetch("http://localhost:3001/api/users/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error("Failed to save")

            toast.success("Profile updated successfully")
            setEditMode(false)
            fetchProfile()
        } catch {
            toast.error("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setSaving(true)
        const token = localStorage.getItem("token")

        try {
            const res = await fetch("http://localhost:3001/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            })

            if (!res.ok) throw new Error("Failed")

            toast.success("Password changed successfully")
            setShowPasswordForm(false)
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        } catch {
            toast.error("Failed to change password. Check your current password.")
        } finally {
            setSaving(false)
        }
    }

    const handlePhotoUpload = () => {
        // Create file input
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (!file) return

            // For now, show a toast - full implementation requires backend file upload
            toast.info("Photo upload requires backend file storage setup")
        }
        input.click()
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (!user) return <div>Failed to load profile</div>

    const initials = user.employeeProfile
        ? `${user.employeeProfile.firstName?.[0] || ''}${user.employeeProfile.lastName?.[0] || ''}`
        : user.email[0].toUpperCase()

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                        My Profile
                    </h1>
                    <p className="text-slate-300 font-medium">Manage your personal information and account settings</p>
                </div>
                <div className="flex gap-2">
                    {editMode ? (
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => setEditMode(false)}
                                className="text-muted-foreground"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {saving ? "Saving..." : "Save"}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => setEditMode(true)}
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                {/* Profile Card */}
                <Card className="h-fit border-0 bg-white/5 backdrop-blur-xl">
                    <CardHeader className="text-center">
                        {/* Avatar with Upload Button */}
                        <div className="mx-auto mb-4 relative group">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 p-[2px] shadow-lg shadow-blue-500/30">
                                <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                    <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-sky-300 to-blue-400">{initials}</span>
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-2 h-4 w-4 rounded-full bg-green-500 border-2 border-black"></div>

                            {/* Upload overlay */}
                            <button
                                onClick={handlePhotoUpload}
                                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <Camera className="h-6 w-6 text-white" />
                            </button>
                        </div>

                        <CardTitle className="text-xl font-bold text-white tracking-wide">{user.employeeProfile?.firstName} {user.employeeProfile?.lastName}</CardTitle>
                        <CardDescription className="text-sky-200/80 font-medium">{user.email}</CardDescription>
                        <div className="mt-3">
                            <Badge className="bg-gradient-to-r from-sky-500/20 to-blue-600/20 text-sky-400 border border-sky-500/30 hover:from-sky-500/30 hover:to-blue-600/30 shadow-sm shadow-sky-500/10">
                                {user.role}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-blue-400" />
                                <span>{user.employeeProfile?.department || "Not set"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-400" />
                                <span>{user.employeeProfile?.position || "Not set"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-400" />
                                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details & Settings */}
                <div className="space-y-6">
                    {/* Personal Details */}
                    <Card className="border-0 bg-white/5 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-white">Personal Details</CardTitle>
                            <CardDescription className="text-slate-400">
                                {editMode ? "Update your information below" : "Your official employment details"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-sky-100/90 font-medium">First Name</Label>
                                    <Input
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        readOnly={!editMode}
                                        className={`bg-white/5 border-white/10 ${editMode ? 'focus:border-blue-500' : ''}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sky-100/90 font-medium">Last Name</Label>
                                    <Input
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        readOnly={!editMode}
                                        className={`bg-white/5 border-white/10 ${editMode ? 'focus:border-blue-500' : ''}`}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-sky-100/90 font-medium">Phone</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        readOnly={!editMode}
                                        placeholder="Not set"
                                        className={`bg-white/5 border-white/10 ${editMode ? 'focus:border-blue-500' : ''}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sky-100/90 font-medium">Employee ID</Label>
                                    <Input
                                        value={user.employeeProfile?.employeeId || ""}
                                        readOnly
                                        className="bg-white/5 border-white/10 text-muted-foreground"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-sky-100/90 font-medium">Department</Label>
                                    <Input
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        readOnly={!editMode}
                                        placeholder="Not set"
                                        className={`bg-white/5 border-white/10 ${editMode ? 'focus:border-blue-500' : ''}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sky-100/90 font-medium">Position</Label>
                                    <Input
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        readOnly={!editMode}
                                        placeholder="Not set"
                                        className={`bg-white/5 border-white/10 ${editMode ? 'focus:border-blue-500' : ''}`}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input
                                    value={user.email}
                                    readOnly
                                    className="bg-white/5 border-white/10 text-muted-foreground"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Section */}
                    <Card className="border-0 bg-white/5 backdrop-blur-xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-blue-400" />
                                        Security
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">Manage your password and security settings</CardDescription>
                                </div>
                                {!showPasswordForm && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowPasswordForm(true)}
                                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                    >
                                        <Lock className="mr-2 h-4 w-4" />
                                        Change Password
                                    </Button>
                                )}
                            </div>
                        </CardHeader>

                        {showPasswordForm && (
                            <CardContent className="space-y-4">
                                <Separator className="bg-white/10" />
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                type={showPasswords ? "text" : "password"}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="bg-white/5 border-white/10 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(!showPasswords)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                            >
                                                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>New Password</Label>
                                            <Input
                                                type={showPasswords ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="bg-white/5 border-white/10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Confirm Password</Label>
                                            <Input
                                                type={showPasswords ? "text" : "password"}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="bg-white/5 border-white/10"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setShowPasswordForm(false)
                                                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handlePasswordChange}
                                            disabled={saving}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {saving ? "Updating..." : "Update Password"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Activity */}
                    <Card className="border-0 bg-white/5 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-400" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription className="text-slate-400">Your recent login and account activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                    <div>
                                        <p className="text-sm font-medium text-white">Login</p>
                                        <p className="text-xs text-slate-400">Today at {new Date().toLocaleTimeString()}</p>
                                    </div>
                                    <Badge variant="outline" className="text-green-400 border-green-500/30">Success</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                    <div>
                                        <p className="text-sm font-medium text-white">Account Created</p>
                                        <p className="text-xs text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <Badge variant="outline" className="text-blue-400 border-blue-500/30">System</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
