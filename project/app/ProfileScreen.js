import React, { useState, useCallback } from "react";
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, Alert, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const API = "http://10.0.2.2:3000/api";

function fmt(n) {
    return Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

function StatChip({ icon, label, value, color }) {
    return (
        <View style={chip.container}>
            <Ionicons name={icon} size={18} color={color} />
            <View>
                <Text style={chip.label}>{label}</Text>
                <Text style={[chip.value, { color }]}>{value}</Text>
            </View>
        </View>
    );
}
const chip = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: "#17213A", borderRadius: 14, padding: 14,
        flexDirection: "row", alignItems: "center", gap: 10,
        borderWidth: 1, borderColor: "#23304F",
    },
    label: { color: "#8F9BB3", fontSize: 11 },
    value: { fontSize: 15, fontWeight: "bold" },
});

export default function ProfileScreen() {
    const navigation         = useNavigation();
    const { currentUser, logout } = useAuth();

    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
    const [loading, setLoading] = useState(true);

    const currentMonth = new Date().toISOString().slice(0, 7);

    const loadData = async () => {
        if (!currentUser) return;
        try {
            const res = await axios.get(`${API}/summary?userId=${currentUser.id}&month=${currentMonth}`);
            if (res.data.success) setSummary(res.data.data);
        } catch {/* ignore */}
        finally { setLoading(false); }
    };

    useFocusEffect(useCallback(() => { loadData(); }, [currentUser]));

    const handleLogout = () => {
        Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบหรือไม่?", [
            { text: "ยกเลิก", style: "cancel" },
            {
                text: "ออกจากระบบ", style: "destructive",
                onPress: async () => {
                    await logout();
                    navigation.replace("Login");
                },
            },
        ]);
    };

    const initials = (currentUser?.username || "U").slice(0, 2).toUpperCase();

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: "#0B1120", justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#21D07A" />
            </View>
        );
    }

    return (
        <SafeAreaView style={s.safe}>
            <ScrollView contentContainerStyle={s.container}>
                {/* Avatar & Name */}
                <View style={s.profileHeader}>
                    <View style={s.avatarCircle}>
                        <Text style={s.initials}>{initials}</Text>
                    </View>
                    <Text style={s.name}>{currentUser?.username || "ผู้ใช้งาน"}</Text>
                    <Text style={s.email}>{currentUser?.email || ""}</Text>
                </View>

                {/* Monthly Stats */}
                <Text style={s.sectionTitle}>สรุปเดือนนี้</Text>
                <View style={s.statsRow}>
                    <StatChip icon="trending-up"   label="รายรับ"     value={`฿ ${fmt(summary.totalIncome)}`}   color="#21D07A" />
                    <StatChip icon="trending-down"  label="รายจ่าย"   value={`฿ ${fmt(summary.totalExpense)}`}  color="#EF4444" />
                </View>
                <View style={[s.balRow, { backgroundColor: summary.balance >= 0 ? "#16422E" : "#4B1818" }]}>
                    <Text style={s.balLabel}>ยอดคงเหลือเดือนนี้</Text>
                    <Text style={[s.balVal, { color: summary.balance >= 0 ? "#21D07A" : "#EF4444" }]}>
                        ฿ {fmt(summary.balance)}
                    </Text>
                </View>

                {/* About */}
                <Text style={s.sectionTitle}>เกี่ยวกับแอป</Text>
                <View style={s.infoCard}>
                    <View style={s.infoRow}>
                        <Ionicons name="phone-portrait" size={18} color="#8F9BB3" />
                        <Text style={s.infoLabel}>ชื่อแอป</Text>
                        <Text style={s.infoVal}>Expense Tracker</Text>
                    </View>
                    <View style={s.divider} />
                    <View style={s.infoRow}>
                        <Ionicons name="git-branch" size={18} color="#8F9BB3" />
                        <Text style={s.infoLabel}>เวอร์ชัน</Text>
                        <Text style={s.infoVal}>1.0.0</Text>
                    </View>
                    <View style={s.divider} />
                    <View style={s.infoRow}>
                        <Ionicons name="server" size={18} color="#8F9BB3" />
                        <Text style={s.infoLabel}>ฐานข้อมูล</Text>
                        <Text style={s.infoVal}>MySQL</Text>
                    </View>
                    <View style={s.divider} />
                    <View style={s.infoRow}>
                        <Ionicons name="code-slash" size={18} color="#8F9BB3" />
                        <Text style={s.infoLabel}>Framework</Text>
                        <Text style={s.infoVal}>Expo SDK 56 + React Native</Text>
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out" size={22} color="#EF4444" />
                    <Text style={s.logoutTxt}>ออกจากระบบ</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#0B1120" },
    container: { padding: 24, paddingBottom: 48 },
    profileHeader: { alignItems: "center", marginBottom: 28 },
    avatarCircle: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: "#21D07A", justifyContent: "center", alignItems: "center",
        marginBottom: 14, elevation: 8,
        shadowColor: "#21D07A", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5, shadowRadius: 10,
    },
    initials: { color: "#fff", fontSize: 32, fontWeight: "bold" },
    name: { color: "#fff", fontSize: 24, fontWeight: "bold" },
    email: { color: "#8F9BB3", fontSize: 15, marginTop: 4 },
    sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 },
    statsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
    balRow: {
        borderRadius: 16, padding: 16, flexDirection: "row",
        justifyContent: "space-between", alignItems: "center", marginBottom: 24,
    },
    balLabel: { color: "#fff", fontSize: 15, fontWeight: "600" },
    balVal: { fontSize: 20, fontWeight: "bold" },
    infoCard: {
        backgroundColor: "#17213A", borderRadius: 18, padding: 4,
        marginBottom: 24, borderWidth: 1, borderColor: "#23304F",
    },
    infoRow: {
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingHorizontal: 16, paddingVertical: 14,
    },
    infoLabel: { color: "#8F9BB3", fontSize: 14, flex: 1 },
    infoVal: { color: "#fff", fontSize: 14, fontWeight: "500" },
    divider: { height: 1, backgroundColor: "#23304F", marginHorizontal: 16 },
    logoutBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 10, backgroundColor: "#2D1B1B", borderRadius: 16, padding: 18,
        borderWidth: 1, borderColor: "#EF444444",
    },
    logoutTxt: { color: "#EF4444", fontSize: 17, fontWeight: "bold" },
});