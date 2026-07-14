import React, { useState, useCallback } from "react";
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, ActivityIndicator, Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { PieChart, LineChart } from "react-native-chart-kit";

const API = "http://10.0.2.2:3000/api";
const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth > 800 ? 760 : screenWidth - 48;

const CATEGORY_COLORS = ["#21D07A", "#F59E0B", "#EF4444", "#A78BFA", "#38BDF8", "#FB923C", "#34D399"];
const CATEGORY_ICONS = {
    "อาหาร": "🍜", "เดินทาง": "🚌", "ที่พัก": "🏠", "สุขภาพ": "💊",
    "บันเทิง": "🎮", "ช้อปปิ้ง": "🛒", "อื่นๆ": "📌", "เงินเดือน": "💼", "รายได้อื่น": "💰",
};

function fmt(n) { return Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 }); }
function addMonths(dateStr, delta) {
    const d = new Date(dateStr + "-01");
    d.setMonth(d.getMonth() + delta);
    return d.toISOString().slice(0, 7);
}
function monthLabel(m) {
    return new Date(m + "-01").toLocaleDateString("th-TH", { month: "long", year: "numeric" });
}

export default function ReportScreen() {
    const { currentUser } = useAuth();
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, byCategory: [], byDay: [] });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const pieData = summary.byCategory.slice(0, 6).map((c, i) => ({
        name: c.category,
        population: Number(c.total),
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        legendFontColor: "#94A3B8",
        legendFontSize: 13,
    }));

    // Trend chart data (Grouped by 5-day intervals)
    const lineLabels = ["1-5", "6-10", "11-15", "16-20", "21-25", "26+"];
    const lineData = [0, 0, 0, 0, 0, 0];
    summary.byDay.forEach(d => {
        const day = d.day;
        const val = Number(d.total);
        if (day <= 5) lineData[0] += val;
        else if (day <= 10) lineData[1] += val;
        else if (day <= 15) lineData[2] += val;
        else if (day <= 20) lineData[3] += val;
        else if (day <= 25) lineData[4] += val;
        else lineData[5] += val;
    });

    const top5 = transactions.filter(t => t.type === "expense").sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);

    // Pattern Analysis
    let highestPeriod = 0;
    let maxSpend = 0;
    lineData.forEach((val, i) => { if (val > maxSpend) { maxSpend = val; highestPeriod = i; } });
    const periodNames = ["ต้นเดือน (1-5)", "ต้นเดือน (6-10)", "กลางเดือน (11-15)", "กลางเดือน (16-20)", "ปลายเดือน (21-25)", "ปลายเดือน (26+)"];

    if (loading) {
        return <View style={s.center}><ActivityIndicator size="large" color="#21D07A" /></View>;
    }

    return (
        <View style={s.container}>
            {/* Month Selector */}
            <View style={s.header}>
                <Text style={s.title}>วิเคราะห์พฤติกรรม</Text>
                <View style={s.monthBar}>
                    <TouchableOpacity onPress={() => setMonth(addMonths(month, -1))} style={s.navBtn}>
                        <Ionicons name="chevron-back" size={24} color="#A78BFA" />
                    </TouchableOpacity>
                    <Text style={s.monthTxt}>{monthLabel(month)}</Text>
                    <TouchableOpacity onPress={() => setMonth(addMonths(month, 1))} style={s.navBtn}>
                        <Ionicons name="chevron-forward" size={24} color="#A78BFA" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={s.content}>
                {/* Donut Chart (Simulated with absolute circle) */}
                {pieData.length > 0 && (
                    <View style={s.card}>
                        <Text style={s.cardTitle}>สัดส่วนรายจ่ายตามหมวดหมู่</Text>
                        <View style={{ position: 'relative', alignItems: 'center' }}>
                            <PieChart
                                data={pieData}
                                width={chartWidth}
                                height={200}
                                chartConfig={chartConfig}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                absolute
                            />
                            {/* Fake Donut Hole */}
                            <View style={s.donutHole} />
                        </View>
                    </View>
                )}

                {/* Trend Line Chart */}
                {lineData.some(v => v > 0) && (
                    <View style={s.card}>
                        <Text style={s.cardTitle}>แนวโน้มการใช้จ่าย (Trend)</Text>
                        <LineChart
                            data={{ labels: lineLabels, datasets: [{ data: lineData }] }}
                            width={chartWidth}
                            height={220}
                            chartConfig={lineChartConfig}
                            bezier
                            style={{ borderRadius: 16, marginLeft: -10 }}
                        />
                    </View>
                )}

                {/* Pattern Analysis */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>🤖 AI วิเคราะห์พฤติกรรม</Text>
                    <View style={s.insightBox}>
                        <Ionicons name="bulb" size={24} color="#F59E0B" />
                        <View style={{ flex: 1 }}>
                            <Text style={s.insightText}>
                                เดือนนี้คุณมีการใช้จ่ายหนาแน่นที่สุดในช่วง <Text style={{ color: "#F59E0B", fontWeight: "bold" }}>{periodNames[highestPeriod]}</Text> 
                                เป็นจำนวนเงิน ฿{fmt(maxSpend)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Top 5 Expenses */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>🔥 5 อันดับรายจ่ายสูงสุด</Text>
                    {top5.map((item, index) => (
                        <View key={item.id} style={s.topCard}>
                            <Text style={s.rankTxt}>#{index + 1}</Text>
                            <View style={[s.txIcon, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]}>
                                <Text style={{ fontSize: 18 }}>{CATEGORY_ICONS[item.category] || "📌"}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.txTitle} numberOfLines={1}>{item.title || item.category}</Text>
                                <Text style={s.txSub}>{item.date?.slice(0, 10)}</Text>
                            </View>
                            <Text style={s.txAmt}>-฿{fmt(item.amount)}</Text>
                        </View>
                    ))}
                    {top5.length === 0 && <Text style={{ color: "#94A3B8" }}>ไม่มีรายการใช้จ่าย</Text>}
                </View>
            </ScrollView>
        </View>
    );
}

const chartConfig = {
    color: (opacity = 1) => `rgba(33, 208, 122, ${opacity})`,
};
const lineChartConfig = {
    backgroundColor: "#0F172A",
    backgroundGradientFrom: "#0F172A",
    backgroundGradientTo: "#0F172A",
    color: (opacity = 1) => `rgba(167, 139, 250, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(143, 155, 179, ${opacity})`,
    propsForDots: { r: "5", strokeWidth: "2", stroke: "#A78BFA" },
};

const s = StyleSheet.create({
    center: { flex: 1, backgroundColor: "#060A13", justifyContent: "center", alignItems: "center" },
    container: { flex: 1, backgroundColor: "#060A13" },
    header: { padding: 24, paddingBottom: 16, backgroundColor: "#0B1120", borderBottomWidth: 1, borderBottomColor: "#1E293B" },
    title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 16 },
    monthBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#0F172A", borderRadius: 16, padding: 8, borderWidth: 1, borderColor: "#1E293B" },
    navBtn: { padding: 8 },
    monthTxt: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    content: { padding: 24, paddingBottom: 40 },
    card: { backgroundColor: "#0F172A", borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "#1E293B" },
    cardTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 16 },
    donutHole: { position: 'absolute', top: 60, left: 60, width: 80, height: 80, borderRadius: 40, backgroundColor: "#0F172A" },
    insightBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(245, 158, 11, 0.1)", padding: 16, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: "rgba(245, 158, 11, 0.3)" },
    insightText: { color: "#fff", fontSize: 15, lineHeight: 22 },
    topCard: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#1E293B" },
    rankTxt: { color: "#94A3B8", fontSize: 16, fontWeight: "bold", width: 24 },
    txIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    txTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
    txSub: { color: "#94A3B8", fontSize: 12 },
    txAmt: { fontSize: 16, fontWeight: "bold", color: "#EF4444" },
});