import React, { useState, useCallback } from "react";
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, FlatList, ActivityIndicator, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { PieChart, BarChart } from "react-native-chart-kit";

const API = "http://10.0.2.2:3000/api";
const { width } = Dimensions.get("window");

const CATEGORY_COLORS = [
    "#21D07A", "#F59E0B", "#EF4444", "#A78BFA",
    "#38BDF8", "#FB923C", "#34D399",
];
const CATEGORY_ICONS = {
    "อาหาร": "🍜", "เดินทาง": "🚌", "ที่พัก": "🏠",
    "สุขภาพ": "💊", "บันเทิง": "🎮", "ช้อปปิ้ง": "🛒",
    "อื่นๆ": "📌", "เงินเดือน": "💼", "รายได้อื่น": "💰",
};

function fmt(n) {
    return Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

function addMonths(dateStr, delta) {
    const d = new Date(dateStr + "-01");
    d.setMonth(d.getMonth() + delta);
    return d.toISOString().slice(0, 7);
}

function monthLabel(m) {
    const d = new Date(m + "-01");
    return d.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
}

export default function ReportScreen() {
    const { currentUser } = useAuth();
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, byCategory: [], byDay: [] });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview"); // "overview" | "list"

    const loadData = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const [summRes, expRes] = await Promise.all([
                axios.get(`${API}/summary?userId=${currentUser.id}&month=${month}`),
                axios.get(`${API}/expenses?userId=${currentUser.id}&month=${month}`),
            ]);
            if (summRes.data.success) setSummary(summRes.data.data);
            if (expRes.data.success)  setTransactions(expRes.data.data);
        } catch (err) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { loadData(); }, [currentUser, month]));

    // ─── Pie chart data ───────────────────────────────────────────────────────
    const pieData = summary.byCategory.slice(0, 7).map((c, i) => ({
        name: c.category,
        population: Number(c.total),
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        legendFontColor: "#8F9BB3",
        legendFontSize: 12,
    }));

    // ─── Bar chart data ───────────────────────────────────────────────────────
    const daysInMonth = new Date(month + "-01");
    const dayCount = new Date(daysInMonth.getFullYear(), daysInMonth.getMonth() + 1, 0).getDate();
    const barLabels = [];
    const barData = [];
    for (let d = 1; d <= dayCount; d += 5) {
        barLabels.push(String(d));
        const found = summary.byDay.find(x => x.day === d);
        barData.push(found ? Number(found.total) : 0);
    }

    // ─── Average daily expense ─────────────────────────────────────────────
    const daysWithData = summary.byDay.length || 1;
    const avgDaily = summary.totalExpense / daysWithData;

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: "#0B1120", justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#21D07A" />
            </View>
        );
    }

    return (
        <SafeAreaView style={s.safe}>
            {/* Month Selector */}
            <View style={s.monthBar}>
                <TouchableOpacity onPress={() => setMonth(addMonths(month, -1))}>
                    <Ionicons name="chevron-back" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={s.monthTxt}>{monthLabel(month)}</Text>
                <TouchableOpacity onPress={() => setMonth(addMonths(month, 1))}>
                    <Ionicons name="chevron-forward" size={26} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Tab Bar */}
            <View style={s.tabBar}>
                {[
                    { key: "overview", label: "ภาพรวม" },
                    { key: "list",     label: "รายการ" },
                ].map(t => (
                    <TouchableOpacity
                        key={t.key}
                        style={[s.tabBtn, activeTab === t.key && s.tabBtnActive]}
                        onPress={() => setActiveTab(t.key)}
                    >
                        <Text style={[s.tabTxt, activeTab === t.key && s.tabTxtActive]}>{t.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={s.container}>
                {activeTab === "overview" ? (
                    <>
                        {/* Summary Cards */}
                        <View style={s.row}>
                            <View style={[s.summCard, { borderColor: "#21D07A44" }]}>
                                <Text style={s.summLabel}>รายรับ</Text>
                                <Text style={[s.summVal, { color: "#21D07A" }]}>฿ {fmt(summary.totalIncome)}</Text>
                            </View>
                            <View style={[s.summCard, { borderColor: "#EF444444" }]}>
                                <Text style={s.summLabel}>รายจ่าย</Text>
                                <Text style={[s.summVal, { color: "#EF4444" }]}>฿ {fmt(summary.totalExpense)}</Text>
                            </View>
                        </View>
                        <View style={[s.balCard, { backgroundColor: summary.balance >= 0 ? "#16422E" : "#4B1818" }]}>
                            <Text style={s.balLabel}>ยอดคงเหลือ</Text>
                            <Text style={[s.balVal, { color: summary.balance >= 0 ? "#21D07A" : "#EF4444" }]}>
                                ฿ {fmt(summary.balance)}
                            </Text>
                        </View>

                        {/* Insights */}
                        <View style={s.insightCard}>
                            <Text style={s.sectionTitle}>📊 วิเคราะห์พฤติกรรม</Text>
                            <View style={s.insightRow}>
                                <Ionicons name="stats-chart" size={16} color="#A78BFA" />
                                <Text style={s.insightTxt}>
                                    ค่าใช้จ่ายเฉลี่ยต่อวัน: <Text style={{ color: "#A78BFA", fontWeight: "bold" }}>฿ {fmt(avgDaily)}</Text>
                                </Text>
                            </View>
                            <View style={s.insightRow}>
                                <Ionicons name="calendar" size={16} color="#F59E0B" />
                                <Text style={s.insightTxt}>
                                    จำนวนวันที่มีรายจ่าย: <Text style={{ color: "#F59E0B", fontWeight: "bold" }}>{summary.byDay.length} วัน</Text>
                                </Text>
                            </View>
                            {summary.byDay.length > 0 && (() => {
                                const maxDay = summary.byDay.reduce((a, b) => Number(a.total) > Number(b.total) ? a : b);
                                return (
                                    <View style={s.insightRow}>
                                        <Ionicons name="flame" size={16} color="#EF4444" />
                                        <Text style={s.insightTxt}>
                                            วันที่ใช้จ่ายมากสุด: วันที่ <Text style={{ color: "#EF4444", fontWeight: "bold" }}>{maxDay.day}</Text>
                                            {" "}(฿ {fmt(maxDay.total)})
                                        </Text>
                                    </View>
                                );
                            })()}
                        </View>

                        {/* Pie Chart */}
                        {pieData.length > 0 && (
                            <View style={s.chartCard}>
                                <Text style={s.sectionTitle}>หมวดหมู่ค่าใช้จ่าย</Text>
                                <PieChart
                                    data={pieData}
                                    width={width - 48}
                                    height={180}
                                    chartConfig={chartConfig}
                                    accessor="population"
                                    backgroundColor="transparent"
                                    paddingLeft="8"
                                    absolute
                                />
                                {/* Category list */}
                                {summary.byCategory.map((c, i) => {
                                    const pct = summary.totalExpense > 0 ? ((Number(c.total) / summary.totalExpense) * 100).toFixed(1) : 0;
                                    return (
                                        <View key={c.category} style={s.catRow}>
                                            <View style={[s.catDot, { backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }]} />
                                            <Text style={s.catIcon}>{CATEGORY_ICONS[c.category] || "📌"}</Text>
                                            <Text style={s.catName}>{c.category}</Text>
                                            <View style={{ flex: 1 }} />
                                            <Text style={s.catPct}>{pct}%</Text>
                                            <Text style={s.catAmt}>฿ {fmt(c.total)}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* Bar Chart */}
                        {barData.some(v => v > 0) && (
                            <View style={s.chartCard}>
                                <Text style={s.sectionTitle}>ค่าใช้จ่ายรายวัน</Text>
                                <BarChart
                                    data={{ labels: barLabels, datasets: [{ data: barData }] }}
                                    width={width - 48}
                                    height={200}
                                    chartConfig={chartConfig}
                                    style={{ borderRadius: 12 }}
                                    fromZero
                                    showValuesOnTopOfBars={false}
                                />
                            </View>
                        )}

                        {summary.totalExpense === 0 && (
                            <View style={s.empty}>
                                <Text style={s.emptyIcon}>📭</Text>
                                <Text style={s.emptyTxt}>ไม่มีรายการในเดือนนี้</Text>
                            </View>
                        )}
                    </>
                ) : (
                    /* ─── Transaction List Tab ─── */
                    <>
                        {transactions.length === 0 ? (
                            <View style={s.empty}>
                                <Text style={s.emptyIcon}>📭</Text>
                                <Text style={s.emptyTxt}>ไม่มีรายการในเดือนนี้</Text>
                            </View>
                        ) : (
                            transactions.map(item => (
                                <View key={item.id} style={s.txCard}>
                                    <View style={[s.txIcon, { backgroundColor: item.type === "income" ? "#16422E" : "#2D1B1B" }]}>
                                        <Text style={{ fontSize: 18 }}>{CATEGORY_ICONS[item.category] || "📌"}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.txTitle} numberOfLines={1}>{item.title || item.category}</Text>
                                        <Text style={s.txSub}>{item.category} • {item.date?.slice(0, 10)}</Text>
                                    </View>
                                    <Text style={[s.txAmt, { color: item.type === "income" ? "#21D07A" : "#EF4444" }]}>
                                        {item.type === "income" ? "+" : "-"}฿ {fmt(item.amount)}
                                    </Text>
                                </View>
                            ))
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const chartConfig = {
    backgroundColor: "#17213A",
    backgroundGradientFrom: "#17213A",
    backgroundGradientTo: "#17213A",
    color: (opacity = 1) => `rgba(33, 208, 122, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(143, 155, 179, ${opacity})`,
    style: { borderRadius: 12 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#21D07A" },
};

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#0B1120" },
    monthBar: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: "#23304F",
    },
    monthTxt: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    tabBar: {
        flexDirection: "row", backgroundColor: "#17213A",
        marginHorizontal: 20, marginTop: 14, borderRadius: 12, padding: 4,
    },
    tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
    tabBtnActive: { backgroundColor: "#21D07A" },
    tabTxt: { color: "#8F9BB3", fontWeight: "600" },
    tabTxtActive: { color: "#fff" },
    container: { padding: 20, paddingTop: 14, paddingBottom: 40 },
    row: { flexDirection: "row", gap: 12, marginBottom: 12 },
    summCard: {
        flex: 1, backgroundColor: "#17213A", borderRadius: 16, padding: 16,
        borderWidth: 1,
    },
    summLabel: { color: "#8F9BB3", fontSize: 13, marginBottom: 6 },
    summVal: { fontSize: 18, fontWeight: "bold" },
    balCard: { borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    balLabel: { color: "#fff", fontSize: 15, fontWeight: "600" },
    balVal: { fontSize: 22, fontWeight: "bold" },
    insightCard: {
        backgroundColor: "#17213A", borderRadius: 18, padding: 16,
        marginBottom: 16, borderWidth: 1, borderColor: "#23304F",
    },
    sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 },
    insightRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    insightTxt: { color: "#8F9BB3", fontSize: 14, flex: 1 },
    chartCard: {
        backgroundColor: "#17213A", borderRadius: 18, padding: 16,
        marginBottom: 16, borderWidth: 1, borderColor: "#23304F",
    },
    catRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: "#23304F" },
    catDot: { width: 10, height: 10, borderRadius: 5 },
    catIcon: { fontSize: 16 },
    catName: { color: "#fff", fontSize: 14 },
    catPct: { color: "#8F9BB3", fontSize: 13, marginRight: 8 },
    catAmt: { color: "#fff", fontSize: 14, fontWeight: "600", minWidth: 90, textAlign: "right" },
    txCard: {
        backgroundColor: "#17213A", borderRadius: 14, padding: 14, marginBottom: 10,
        flexDirection: "row", alignItems: "center", gap: 12,
        borderWidth: 1, borderColor: "#23304F",
    },
    txIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    txTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
    txSub: { color: "#8F9BB3", fontSize: 12, marginTop: 2 },
    txAmt: { fontSize: 15, fontWeight: "bold" },
    empty: { alignItems: "center", paddingVertical: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyTxt: { color: "#8F9BB3", fontSize: 16 },
});