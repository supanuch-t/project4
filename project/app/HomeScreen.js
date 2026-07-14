import React, { useEffect, useState, useCallback } from "react";
import {
    View, Text, FlatList, StyleSheet, SafeAreaView,
    TouchableOpacity, RefreshControl, ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useAuth } from "./context/AuthContext";

const API = "http://10.0.2.2:3000/api";

const CATEGORY_ICONS = {
    "อาหาร": "🍜", "เดินทาง": "🚌", "ที่พัก": "🏠",
    "สุขภาพ": "💊", "บันเทิง": "🎮", "ช้อปปิ้ง": "🛒",
    "อื่นๆ": "📌", "เงินเดือน": "💼", "รายได้อื่น": "💰",
};

function getMonthLabel(date) {
    return date.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
}

function fmt(n) {
    return Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

export default function HomeScreen() {
    const navigation = useNavigation();
    const { currentUser } = useAuth();

    const [expenses, setExpenses]       = useState([]);
    const [summary, setSummary]         = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
    const [budget, setBudget]           = useState({ daily_budget: 0, monthly_budget: 0 });
    const [todayTotal, setTodayTotal]   = useState(0);
    const [loading, setLoading]         = useState(true);
    const [refreshing, setRefreshing]   = useState(false);

    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    const loadData = async () => {
        if (!currentUser) return;
        try {
            const [expRes, summRes, budRes, todayRes] = await Promise.all([
                axios.get(`${API}/expenses?userId=${currentUser.id}&month=${currentMonth}`),
                axios.get(`${API}/summary?userId=${currentUser.id}&month=${currentMonth}`),
                axios.get(`${API}/budget?userId=${currentUser.id}`),
                axios.get(`${API}/expenses/today?userId=${currentUser.id}`),
            ]);

            if (expRes.data.success)     setExpenses(expRes.data.data);
            if (summRes.data.success)    setSummary(summRes.data.data);
            if (budRes.data.success)     setBudget(budRes.data.data);
            if (todayRes.data.success) {
                const t = todayRes.data.data.reduce((s, i) => s + Number(i.amount), 0);
                setTodayTotal(t);
            }
        } catch (err) {
            console.log("โหลดข้อมูลไม่สำเร็จ:", err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // โหลดใหม่ทุกครั้งที่กลับมาหน้านี้
    useFocusEffect(useCallback(() => { loadData(); }, [currentUser]));

    const onRefresh = () => { setRefreshing(true); loadData(); };

    // ─── Budget alert ────────────────────────────────────────────────────────
    const overMonthly = budget.monthly_budget > 0 && summary.totalExpense > budget.monthly_budget;
    const overDaily   = budget.daily_budget > 0 && todayTotal > budget.daily_budget;

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B1120" }}>
                <ActivityIndicator size="large" color="#21D07A" />
            </View>
        );
    }

    return (
        <SafeAreaView style={s.safe}>
            <FlatList
                data={expenses.slice(0, 20)}
                keyExtractor={item => item.id.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#21D07A" />}
                ListHeaderComponent={() => (
                    <View style={s.headerWrapper}>
                        {/* Topbar */}
                        <View style={s.topbar}>
                            <View>
                                <Text style={s.hello}>สวัสดี 👋</Text>
                                <Text style={s.username}>{currentUser?.username || "ผู้ใช้งาน"}</Text>
                            </View>
                            <View style={s.avatar}>
                                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                                    {(currentUser?.username || "U")[0].toUpperCase()}
                                </Text>
                            </View>
                        </View>

                        {/* Budget Alert */}
                        {(overMonthly || overDaily) && (
                            <View style={s.alertBanner}>
                                <Ionicons name="warning" size={18} color="#FCD34D" />
                                <Text style={s.alertText}>
                                    {overMonthly ? "⚠️ ค่าใช้จ่ายเดือนนี้เกินงบประมาณที่กำหนด!" : ""}
                                    {overMonthly && overDaily ? "\n" : ""}
                                    {overDaily ? "⚠️ ค่าใช้จ่ายวันนี้เกินงบประมาณรายวัน!" : ""}
                                </Text>
                            </View>
                        )}

                        {/* Balance Card */}
                        <View style={[s.balanceCard, { backgroundColor: summary.balance >= 0 ? "#21D07A" : "#EF4444" }]}>
                            <Text style={s.balanceTitle}>ยอดคงเหลือเดือนนี้</Text>
                            <Text style={s.balanceMoney}>฿ {fmt(summary.balance)}</Text>
                            <Text style={s.balanceMonth}>{getMonthLabel(new Date())}</Text>
                        </View>

                        {/* Income / Expense row */}
                        <View style={s.row}>
                            <View style={s.smallCard}>
                                <Ionicons name="trending-up" size={20} color="#21D07A" style={{ marginBottom: 6 }} />
                                <Text style={s.cardTitle}>รายรับ</Text>
                                <Text style={s.income}>฿ {fmt(summary.totalIncome)}</Text>
                            </View>
                            <View style={s.smallCard}>
                                <Ionicons name="trending-down" size={20} color="#EF4444" style={{ marginBottom: 6 }} />
                                <Text style={s.cardTitle}>รายจ่าย</Text>
                                <Text style={s.expense}>฿ {fmt(summary.totalExpense)}</Text>
                            </View>
                        </View>

                        {/* Monthly budget progress */}
                        {budget.monthly_budget > 0 && (
                            <View style={s.budgetCard}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={s.budgetLabel}>งบประมาณเดือนนี้</Text>
                                    <Text style={s.budgetLabel}>฿ {fmt(summary.totalExpense)} / ฿ {fmt(budget.monthly_budget)}</Text>
                                </View>
                                <View style={s.progressBar}>
                                    <View style={[
                                        s.progressFill,
                                        {
                                            width: `${Math.min((summary.totalExpense / budget.monthly_budget) * 100, 100)}%`,
                                            backgroundColor: overMonthly ? "#EF4444" : "#21D07A",
                                        }
                                    ]} />
                                </View>
                            </View>
                        )}

                        <Text style={s.subtitle}>รายการล่าสุด</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View style={s.card}>
                        <View style={s.itemLeft}>
                            <View style={[s.iconCircle, { backgroundColor: item.type === "income" ? "#16423C" : "#2D1B1B" }]}>
                                <Text style={{ fontSize: 20 }}>
                                    {CATEGORY_ICONS[item.category] || "📌"}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.name} numberOfLines={1}>{item.title || item.category}</Text>
                                <Text style={s.category}>{item.category} • {item.date?.slice(0, 10)}</Text>
                            </View>
                        </View>
                        <Text style={[s.money, { color: item.type === "income" ? "#21D07A" : "#EF4444" }]}>
                            {item.type === "income" ? "+" : "-"}฿ {fmt(item.amount)}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={s.empty}>
                        <Text style={s.emptyIcon}>💸</Text>
                        <Text style={s.emptyText}>ยังไม่มีรายการในเดือนนี้</Text>
                        <Text style={s.emptySubText}>กด + เพื่อเพิ่มรายการแรก</Text>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            {/* FAB */}
            <TouchableOpacity style={s.fab} onPress={() => navigation.navigate("AddExpense")}>
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#0B1120" },
    headerWrapper: { padding: 20, paddingBottom: 8 },
    topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    hello: { fontSize: 24, fontWeight: "bold", color: "#fff" },
    username: { color: "#8F9BB3", fontSize: 15, marginTop: 2 },
    avatar: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: "#21D07A", justifyContent: "center", alignItems: "center",
    },
    alertBanner: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#3B2F00", borderRadius: 12,
        padding: 12, marginBottom: 14, gap: 8,
        borderWidth: 1, borderColor: "#FCD34D44",
    },
    alertText: { color: "#FCD34D", fontSize: 13, flex: 1 },
    balanceCard: {
        borderRadius: 20, padding: 24, marginBottom: 16, elevation: 6,
    },
    balanceTitle: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
    balanceMoney: { color: "#fff", fontSize: 36, fontWeight: "bold", marginTop: 8 },
    balanceMonth: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 },
    row: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: 16 },
    smallCard: {
        backgroundColor: "#17213A", flex: 1, padding: 18,
        borderRadius: 18, borderWidth: 1, borderColor: "#23304F",
    },
    cardTitle: { color: "#8F9BB3", fontSize: 13, marginBottom: 4 },
    income: { color: "#21D07A", fontSize: 22, fontWeight: "bold" },
    expense: { color: "#EF4444", fontSize: 22, fontWeight: "bold" },
    budgetCard: {
        backgroundColor: "#17213A", borderRadius: 16, padding: 16,
        marginBottom: 20, borderWidth: 1, borderColor: "#23304F",
    },
    budgetLabel: { color: "#8F9BB3", fontSize: 13 },
    progressBar: {
        height: 8, backgroundColor: "#23304F", borderRadius: 4, marginTop: 10, overflow: "hidden",
    },
    progressFill: { height: "100%", borderRadius: 4 },
    subtitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 12 },
    card: {
        backgroundColor: "#17213A", marginHorizontal: 20, marginBottom: 10,
        borderRadius: 16, padding: 14, flexDirection: "row",
        justifyContent: "space-between", alignItems: "center",
        borderWidth: 1, borderColor: "#23304F",
    },
    itemLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    iconCircle: {
        width: 44, height: 44, borderRadius: 12,
        justifyContent: "center", alignItems: "center",
    },
    name: { color: "#fff", fontSize: 15, fontWeight: "600" },
    category: { color: "#8F9BB3", fontSize: 12, marginTop: 2 },
    money: { fontSize: 16, fontWeight: "bold" },
    empty: { alignItems: "center", paddingVertical: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    emptySubText: { color: "#8F9BB3", fontSize: 14, marginTop: 6 },
    fab: {
        position: "absolute", right: 24, bottom: 28,
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: "#21D07A",
        justifyContent: "center", alignItems: "center",
        elevation: 10,
        shadowColor: "#21D07A", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5, shadowRadius: 8,
    },
});