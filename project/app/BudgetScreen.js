import React, { useState, useCallback } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    SafeAreaView, ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

const API = "http://10.0.2.2:3000/api";

function fmt(n) {
    return Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

function getMonthLabel() {
    return new Date().toLocaleDateString("th-TH", { month: "long", year: "numeric" });
}

function ProgressBar({ value, max, color }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <View style={pb.bar}>
            <View style={[pb.fill, { width: `${pct}%`, backgroundColor: color || "#21D07A" }]} />
        </View>
    );
}
const pb = StyleSheet.create({
    bar: { height: 10, backgroundColor: "#23304F", borderRadius: 5, overflow: "hidden", marginTop: 8 },
    fill: { height: "100%", borderRadius: 5 },
});

export default function BudgetScreen() {
    const { currentUser } = useAuth();

    const [dailyBudget,   setDailyBudget]   = useState("");
    const [monthlyBudget, setMonthlyBudget] = useState("");
    const [summary,  setSummary]  = useState({ totalExpense: 0 });
    const [todayExp, setTodayExp] = useState(0);
    const [loading,  setLoading]  = useState(true);
    const [saving,   setSaving]   = useState(false);

    const currentMonth = new Date().toISOString().slice(0, 7);

    const loadData = async () => {
        if (!currentUser) return;
        try {
            const [budRes, summRes, todayRes] = await Promise.all([
                axios.get(`${API}/budget?userId=${currentUser.id}`),
                axios.get(`${API}/summary?userId=${currentUser.id}&month=${currentMonth}`),
                axios.get(`${API}/expenses/today?userId=${currentUser.id}`),
            ]);
            if (budRes.data.success) {
                const b = budRes.data.data;
                setDailyBudget(b.daily_budget > 0 ? String(b.daily_budget) : "");
                setMonthlyBudget(b.monthly_budget > 0 ? String(b.monthly_budget) : "");
            }
            if (summRes.data.success)  setSummary(summRes.data.data);
            if (todayRes.data.success) {
                const t = todayRes.data.data.reduce((s, i) => s + Number(i.amount), 0);
                setTodayExp(t);
            }
        } catch (err) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { loadData(); }, [currentUser]));

    const saveBudget = async () => {
        if (!currentUser) return;
        setSaving(true);
        try {
            const res = await axios.post(`${API}/budget`, {
                userId: currentUser.id,
                dailyBudget:   parseFloat(dailyBudget)   || 0,
                monthlyBudget: parseFloat(monthlyBudget) || 0,
            });
            if (res.data.success) {
                Alert.alert("สำเร็จ", "บันทึกงบประมาณเรียบร้อย");
                loadData();
            } else {
                Alert.alert("ผิดพลาด", res.data.message);
            }
        } catch {
            Alert.alert("ผิดพลาด", "บันทึกไม่สำเร็จ");
        } finally {
            setSaving(false);
        }
    };

    const db  = parseFloat(dailyBudget)   || 0;
    const mb  = parseFloat(monthlyBudget) || 0;
    const me  = summary.totalExpense;
    const overDaily   = db > 0 && todayExp > db;
    const overMonthly = mb > 0 && me > mb;

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
                {/* Title */}
                <Text style={s.title}>งบประมาณ</Text>
                <Text style={s.subtitle}>{getMonthLabel()}</Text>

                {/* ─── Monthly Status ─────────────────────────────────────── */}
                <View style={s.card}>
                    <View style={s.cardHeader}>
                        <Ionicons name="calendar" size={18} color="#21D07A" />
                        <Text style={s.cardTitle}>งบประมาณรายเดือน</Text>
                        {overMonthly && <View style={s.badge}><Text style={s.badgeText}>เกินงบ!</Text></View>}
                    </View>
                    {mb > 0 ? (
                        <>
                            <View style={s.budgetRow}>
                                <Text style={s.budgetUsed}>ใช้แล้ว: ฿ {fmt(me)}</Text>
                                <Text style={s.budgetTotal}>/ ฿ {fmt(mb)}</Text>
                            </View>
                            <ProgressBar value={me} max={mb} color={overMonthly ? "#EF4444" : "#21D07A"} />
                            <Text style={[s.remaining, { color: overMonthly ? "#EF4444" : "#21D07A" }]}>
                                {overMonthly
                                    ? `เกินงบ ฿ ${fmt(me - mb)}`
                                    : `คงเหลือ ฿ ${fmt(mb - me)}`}
                            </Text>
                        </>
                    ) : (
                        <Text style={s.notSet}>ยังไม่ได้กำหนดงบประมาณรายเดือน</Text>
                    )}
                </View>

                {/* ─── Daily Status ────────────────────────────────────────── */}
                <View style={s.card}>
                    <View style={s.cardHeader}>
                        <Ionicons name="today" size={18} color="#A78BFA" />
                        <Text style={s.cardTitle}>งบประมาณรายวัน (วันนี้)</Text>
                        {overDaily && <View style={[s.badge, { backgroundColor: "#5B1C1C" }]}><Text style={s.badgeText}>เกินงบ!</Text></View>}
                    </View>
                    {db > 0 ? (
                        <>
                            <View style={s.budgetRow}>
                                <Text style={s.budgetUsed}>ใช้แล้ว: ฿ {fmt(todayExp)}</Text>
                                <Text style={s.budgetTotal}>/ ฿ {fmt(db)}</Text>
                            </View>
                            <ProgressBar value={todayExp} max={db} color={overDaily ? "#EF4444" : "#A78BFA"} />
                            <Text style={[s.remaining, { color: overDaily ? "#EF4444" : "#A78BFA" }]}>
                                {overDaily
                                    ? `เกินงบ ฿ ${fmt(todayExp - db)}`
                                    : `คงเหลือ ฿ ${fmt(db - todayExp)}`}
                            </Text>
                        </>
                    ) : (
                        <Text style={s.notSet}>ยังไม่ได้กำหนดงบประมาณรายวัน</Text>
                    )}
                </View>

                {/* ─── Formulas ────────────────────────────────────────────── */}
                <View style={[s.card, { backgroundColor: "#0D1B2E" }]}>
                    <Text style={[s.cardTitle, { marginBottom: 10 }]}>สูตรการคำนวณ</Text>
                    <Text style={s.formula}>งบคงเหลือ = งบประมาณ − ค่าใช้จ่ายรวม</Text>
                    <Text style={s.formula}>สถานะแจ้งเตือน: ค่าใช้จ่าย {">"} งบประมาณ</Text>
                </View>

                {/* ─── Settings ────────────────────────────────────────────── */}
                <View style={s.card}>
                    <Text style={[s.cardTitle, { marginBottom: 16 }]}>ตั้งค่างบประมาณ</Text>

                    <Text style={s.label}>งบประมาณรายวัน (฿)</Text>
                    <TextInput
                        style={s.input}
                        placeholder="เช่น 300"
                        placeholderTextColor="#556"
                        keyboardType="decimal-pad"
                        value={dailyBudget}
                        onChangeText={setDailyBudget}
                    />

                    <Text style={s.label}>งบประมาณรายเดือน (฿)</Text>
                    <TextInput
                        style={s.input}
                        placeholder="เช่น 8000"
                        placeholderTextColor="#556"
                        keyboardType="decimal-pad"
                        value={monthlyBudget}
                        onChangeText={setMonthlyBudget}
                    />

                    <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.7 }]} onPress={saveBudget} disabled={saving}>
                        {saving ? <ActivityIndicator color="#fff" /> : (
                            <>
                                <Ionicons name="save" size={20} color="#fff" />
                                <Text style={s.saveTxt}>บันทึกงบประมาณ</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#0B1120" },
    container: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 4 },
    subtitle: { color: "#8F9BB3", fontSize: 15, marginBottom: 20 },
    card: {
        backgroundColor: "#17213A", borderRadius: 18, padding: 18,
        marginBottom: 16, borderWidth: 1, borderColor: "#23304F",
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    cardTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", flex: 1 },
    badge: {
        backgroundColor: "#4B1818", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
    },
    badgeText: { color: "#EF4444", fontSize: 12, fontWeight: "bold" },
    budgetRow: { flexDirection: "row", justifyContent: "space-between" },
    budgetUsed: { color: "#fff", fontSize: 16, fontWeight: "600" },
    budgetTotal: { color: "#8F9BB3", fontSize: 16 },
    remaining: { fontSize: 14, fontWeight: "600", marginTop: 8 },
    notSet: { color: "#8F9BB3", fontSize: 14, fontStyle: "italic" },
    formula: { color: "#8F9BB3", fontSize: 13, marginBottom: 6, fontFamily: "monospace" },
    label: { color: "#AAB5D1", fontSize: 14, fontWeight: "600", marginBottom: 8 },
    input: {
        backgroundColor: "#0B1120", color: "#fff", borderRadius: 12,
        padding: 14, fontSize: 16, marginBottom: 16,
        borderWidth: 1, borderColor: "#23304F",
    },
    saveBtn: {
        backgroundColor: "#21D07A", borderRadius: 14, padding: 16,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    },
    saveTxt: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});