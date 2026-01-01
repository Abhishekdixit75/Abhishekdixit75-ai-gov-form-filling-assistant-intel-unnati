"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    email: string;
    full_name?: string;
    id: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Load User from Token on startup
        const storedToken = localStorage.getItem("auth_token");
        if (storedToken) {
            setToken(storedToken);
            loadUser(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async (authToken: string) => {
        try {
            const res = await fetch("http://127.0.0.1:8000/users/me", {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                logout(); // Invalid token
            }
        } catch (e) {
            console.error(e);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = (newToken: string) => {
        localStorage.setItem("auth_token", newToken);
        setToken(newToken);
        loadUser(newToken);
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
