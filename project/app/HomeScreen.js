import React, { useEffect, useState, useCallback } from "react";
import {
    View, Text, FlatList, StyleSheet, SafeAreaView,
    TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import { BarChart } from "react-native-chart-kit";

const API = "http://10.0.2.2:3000/api";
const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth > 800 ? 760 : screenWidth - 48; // Account for padding

const CATEGORY_ICONS = {
    "อาหาร": "🍜", "เดินทาง": "🚌", "ที่พัก": "🏠",
    "สุขภาพ": "💊", "บันเทิง": "🎮", "ช้อปปิ้ง": "🛒",
    "อื่นๆ": "📌", "เงินเดือน": "💼", "รายได้อื่น": "💰",
};

function fmt(n) { return Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 }); }
function getMonthLabel() { return new Date().toLocaleDateString("th-TH", { month: "long", year: "numeric" }); }

export default function HomeScreen() {
    const navigation = useNavigation();
    const { currentUser } = useAuth();

    const [expenses, setExpenses]       = useState([]);
    const [summary, setSummary]         = useState({ totalIncome: 0, totalExpense: 0, balance: 0, byDay: [] });
    const [budget, setBudget]           = useState({ daily_budget: 0, monthly_budget: 0 });
    const [userSettings, setUserSettings] = useState({ alert_threshold: 1000, push_enabled: 1 });
    const [loading, setLoading]         = useState(true);
    const [refreshing, setRefreshing]   = useState(false);

    const currentMonth = new Date().toISOString().slice(0, 7);

    const loadData = async () => {
        if (!currentUser) return;
        try {
            const [expRes, summRes, budRes, userRes] = await Promise.all([
                axios.get(`${API}/expenses?userId=${currentUser.id}&month=${currentMonth}`),
                axios.get(`${API}/summary?userId=${currentUser.id}&month=${currentMonth}`),
                axios.get(`${API}/budget?userId=${currentUser.id}`),
                axios.get(`${API}/users/${currentUser.id}`),
            ]);

            if (expRes.data.success)  setExpenses(expRes.data.data);
            if (summRes.data.success) setSummary(summRes.data.data);
            if (budRes.data.success)  setBudget(budRes.data.data);
            if (userRes.data?.success) setUserSettings(userRes.data.data);
        } catch (err) {
            console.log(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { loadData(); }, [currentUser]));

    const onRefresh = () => { setRefreshing(true); loadData(); };

    const me = summary.totalExpense;
    const mb = budget.monthly_budget;
    const overMonthly = mb > 0 && me > mb;

    // Build 30-day chart data
    const daysInMonth = new Date(currentMonth + "-01");
    const dayCount = new Date(daysInMonth.getFullYear(), daysInMonth.getMonth() + 1, 0).getDate();
    const barLabels = [];
    const barData = [];
    for (let d = 1; d <= dayCount; d += Math.ceil(dayCount / 6)) { // Show ~6 labels to prevent crowding
        barLabels.push(String(d));
        const found = summary.byDay.find(x => x.day === d);
        barData.push(found ? Number(found.total) : 0);
    }

    // Check for large transactions alert
    const largeTx = expenses.find(e => e.type === "expense" && Number(e.amount) >= userSettings.alert_threshold);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#060A13" }}>
                <ActivityIndicator size="large" color="#21D07A" />
            </View>
        );
    }

    return (
        <SafeAreaView style={s.safe}>
            <FlatList
                data={expenses.slice(0, 10)} // only show 10 on dashboard
                keyExtractor={item => item.id.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#21D07A" />}
                ListHeaderComponent={() => (
                    <View style={s.headerWrapper}>
                        {/* Topbar */}
                        <View style={s.topbar}>
                            <View>
                                <Text style={s.hello}>ยินดีต้อนรับ 👋</Text>
                                <Text style={s.username}>{currentUser?.username || "ผู้ใช้งาน"}</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate("โปรไฟล์")}>
                                <View style={s.avatar}>
                                    <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                                        {(currentUser?.username || "U")[0].toUpperCase()}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Alerts */}
                        {userSettings.push_enabled === 1 && (
                            <>
                                {overMonthly && (
                                    <View style={[s.alertBanner, { borderColor: "#EF444455", backgroundColor: "rgba(239, 68, 68, 0.15)" }]}>
                                        <Ionicons name="warning" size={20} color="#EF4444" />
                                        <Text style={[s.alertText, { color: "#EF4444" }]}>เดือนนี้คุณใช้เงินเกินงบประมาณที่ตั้งไว้แล้ว!</Text>
                                    </View>
                                )}
                                {largeTx && (
                                    <View style={[s.alertBanner, { borderColor: "#FCD34D55", backgroundColor: "rgba(252, 211, 77, 0.15)" }]}>
                                        <Ionicons name="notifications" size={20} color="#FCD34D" />
                                        <Text style={[s.alertText, { color: "#FCD34D" }]}>
                                            รายการใหญ่ล่าสุด: {largeTx.title} (฿{fmt(largeTx.amount)})
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}

                        {/* Balance Card (Glassmorphism) */}
                        <View style={[s.balanceCard, { backgroundColor: summary.balance >= 0 ? "rgba(33, 208, 122, 0.9)" : "rgba(239, 68, 68, 0.9)" }]}>
                            <Text style={s.balanceTitle}>ยอดคงเหลือสุทธิ</Text>
                            <Text style={s.balanceMoney}>฿ {fmt(summary.balance)}</Text>
                            <Text style={s.balanceMonth}>{getMonthLabel()}</Text>
                            <View style={s.row}>
                                <View style={s.miniStat}>
                                    <Ionicons name="arrow-down-circle" size={16} color="rgba(255,255,255,0.8)" />
                                    <Text style={s.miniStatTxt}>รายรับ: ฿ {fmt(summary.totalIncome)}</Text>
                                </View>
                                <View style={s.miniStat}>
                                    <Ionicons name="arrow-up-circle" size={16} color="rgba(255,255,255,0.8)" />
                                    <Text style={s.miniStatTxt}>รายจ่าย: ฿ {fmt(summary.totalExpense)}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Global Budget Progress */}
                        {mb > 0 && (
                            <View style={s.budgetCard}>
                                <View style={s.budgetHeader}>
                                    <Text style={s.budgetLabel}>งบประมาณรวมเดือนนี้</Text>
                                    <Text style={s.budgetVal}>฿{fmt(me)} / ฿{fmt(mb)}</Text>
                                </View>
                                <View style={s.pbBg}>
                                    <View style={[
                                        s.pbFill, 
                                        { 
                                            width: `${Math.min((me / mb) * 100, 100)}%`,
                                            backgroundColor: overMonthly ? "#EF4444" : "#21D07A"
                                        }
                                    ]} />
                                </View>
                            </View>
                        )}

                        {/* 30-Day Bar Chart */}
                        {barData.some(v => v > 0) && (
                            <View style={s.chartCard}>
                                <Text style={s.sectionTitle}>แนวโน้มรายวัน (30 วัน)</Text>
                                <BarChart
                                    data={{ labels: barLabels, datasets: [{ data: barData }] }}
                                    width={chartWidth}
                                    height={180}
                                    chartConfig={{
                                        backgroundColor: "#0F172A",
                                        backgroundGradientFrom: "#0F172A",
                                        backgroundGradientTo: "#0F172A",
                                        color: (opacity = 1) => `rgba(167, 139, 250, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(143, 155, 179, ${opacity})`,
                                        barPercentage: 0.6,
                                        propsForDots: { r: "0" }
                                    }}
                                    style={{ borderRadius: 12, marginLeft: -10 }}
                                    showValuesOnTopOfBars={false}
                                    withInnerLines={false}
                                />
                            </View>
                        )}

                        <View style={s.sectionHeader}>
                            <Text style={s.sectionTitle}>รายการล่าสุด</Text>
                            <TouchableOpacity onPress={() => navigation.navigate("ประวัติ")}>
                                <Text style={s.seeAll}>ดูทั้งหมด</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View style={s.card}>
                        <View style={s.itemLeft}>
                            <View style={[s.iconCircle, { backgroundColor: item.type === "income" ? "rgba(33,208,122,0.15)" : "rgba(239,68,68,0.15)" }]}>
                                <Text style={{ fontSize: 22 }}>{CATEGORY_ICONS[item.category] || "📌"}</Text>
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
    safe: { flex: 1, backgroundColor: "#060A13" },
    headerWrapper: { padding: 24, paddingBottom: 8 },
    topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    hello: { fontSize: 26, fontWeight: "bold", color: "#fff" },
    username: { color: "#A78BFA", fontSize: 16, marginTop: 2, fontWeight: "600" },
    avatar: {
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: "rgba(167, 139, 250, 0.2)", justifyContent: "center", alignItems: "center",
        borderWidth: 1, borderColor: "rgba(167, 139, 250, 0.5)",
    },
    alertBanner: {
        flexDirection: "row", alignItems: "center", borderRadius: 12,
        padding: 14, marginBottom: 16, gap: 10, borderWidth: 1,
    },
    alertText: { fontSize: 14, flex: 1, fontWeight: "600" },
    balanceCard: {
        borderRadius: 24, padding: 24, marginBottom: 24,
        shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10,
    },
    balanceTitle: { color: "rgba(255,255,255,0.85)", fontSize: 15 },
    balanceMoney: { color: "#fff", fontSize: 40, fontWeight: "bold", marginTop: 8 },
    balanceMonth: { color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 4, marginBottom: 16 },
    row: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)", paddingTop: 16 },
    miniStat: { flexDirection: "row", alignItems: "center", gap: 6 },
    miniStatTxt: { color: "#fff", fontSize: 14, fontWeight: "500" },
    budgetCard: {
        backgroundColor: "#0F172A", borderRadius: 16, padding: 18,
        marginBottom: 24, borderWidth: 1, borderColor: "#1E293B",
    },
    budgetHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    budgetLabel: { color: "#94A3B8", fontSize: 14, fontWeight: "500" },
    budgetVal: { color: "#fff", fontSize: 14, fontWeight: "bold" },
    pbBg: { height: 10, backgroundColor: "#1E293B", borderRadius: 5, overflow: "hidden" },
    pbFill: { height: "100%", borderRadius: 5 },
    chartCard: {
        backgroundColor: "#0F172A", borderRadius: 20, padding: 20,
        marginBottom: 24, borderWidth: 1, borderColor: "#1E293B",
        overflow: "hidden"
    },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
    seeAll: { color: "#A78BFA", fontSize: 14, fontWeight: "600" },
    card: {
        backgroundColor: "#0F172A", marginHorizontal: 24, marginBottom: 12,
        borderRadius: 16, padding: 16, flexDirection: "row",
        justifyContent: "space-between", alignItems: "center",
        borderWidth: 1, borderColor: "#1E293B",
    },
    itemLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
    iconCircle: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
    name: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 4 },
    category: { color: "#94A3B8", fontSize: 13 },
    money: { fontSize: 17, fontWeight: "bold" },
    empty: { alignItems: "center", paddingVertical: 40 },
    emptyIcon: { fontSize: 40, marginBottom: 16 },
    emptyText: { color: "#94A3B8", fontSize: 16 },
    fab: {
        position: "absolute", right: 24, bottom: 24,
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: "#21D07A",
        justifyContent: "center", alignItems: "center",
        shadowColor: "#21D07A", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
    },
});