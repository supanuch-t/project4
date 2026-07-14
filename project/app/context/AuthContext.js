import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ─── โหลด session จาก AsyncStorage เมื่อ app เริ่ม ───────────────────
    useEffect(() => {
        AsyncStorage.getItem("user")
            .then((json) => {
                if (json) setCurrentUser(JSON.parse(json));
            })
            .finally(() => setLoading(false));
    }, []);

    // ─── บันทึก user หลัง login สำเร็จ ──────────────────────────────────
    const login = async (user) => {
        setCurrentUser(user);
        await AsyncStorage.setItem("user", JSON.stringify(user));
    };

    // ─── ล้าง session เมื่อ logout ────────────────────────────────────────
    const logout = async () => {
        setCurrentUser(null);
        await AsyncStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
