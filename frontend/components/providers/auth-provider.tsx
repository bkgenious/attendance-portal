"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
    user: any | null
    loading: boolean
    login: (token: string, userData: any) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem("token")
            if (!token) {
                setLoading(false)
                return
            }

            try {
                // Verify token with backend
                const res = await fetch("http://localhost:3001/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (res.ok) {
                    const userData = await res.json()
                    setUser(userData)
                } else {
                    localStorage.removeItem("token")
                }
            } catch (error) {
                console.error("Auth check failed", error)
            } finally {
                setLoading(false)
            }
        }

        initAuth()
    }, [])

    const login = (token: string, userData: any) => {
        localStorage.setItem("token", token)
        setUser(userData)
        router.push("/dashboard")
    }

    const logout = () => {
        localStorage.removeItem("token")
        setUser(null)
        router.push("/login")
    }

    // Optional: Protect routes logic can be added here or middleware
    // For now we just provide state

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
