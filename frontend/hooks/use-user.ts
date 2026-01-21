import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ApiClient } from "@/lib/api"
import { useRouter } from "next/navigation"

export function useUser() {
    const router = useRouter()
    const queryClient = useQueryClient()

    const { data: user, isLoading, error } = useQuery({
        queryKey: ["user", "me"],
        queryFn: async () => {
            try {
                return await ApiClient.get<any>("/auth/me")
            } catch (err) {
                // If 401, we should probably redirect
                // But ApiClient might throw, let's catch here 
                throw err
            }
        },
        retry: false, // Don't retry if auth fails
        staleTime: 5 * 60 * 1000, // 5 minutes stale time for user data
    })

    const logout = () => {
        localStorage.removeItem("token")
        queryClient.setQueryData(["user", "me"], null)
        router.push("/login")
    }

    return {
        user,
        loading: isLoading,
        error,
        logout,
        isAuthenticated: !!user
    }
}
