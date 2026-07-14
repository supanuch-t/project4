import React, { useState, useCallback } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    SafeAreaView, ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

const API = "http://10.0.2.2:3000/api";

function fmt(n) { return Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 }); }

function ProgressBar({ value, max, color }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <View style={pb.bar}>
            <View style={[pb.fill, { width: `${pct}%`, backgroundColor: color || "#21D07A" }]} />
        </View>
    );
}
const pb = StyleSheet.create({
    bar: { height: 10, backgroundColor: "#1E293B", borderRadius: 5, overflow: "hidden", marginTop: 10 },
    fill: { height: "100%", borderRadius: 5 },
});

const CATEGORIES = ["อาหาร", "เดินทาง", "ที่พัก", "สุขภาพ", "บันเทิง", "ช้อปปิ้ง", "อื่นๆ"];

export default function BudgetScreen() {
    const { currentUser } = useAuth();
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [dailyBudget,   setDailyBudget]   = useState("");
    const [monthlyBudget, setMonthlyBudget] = useState("");
    const [summary,  setSummary]  = useState({ totalExpense: 0, byCategory: [] });
    const [todayExp, setTodayExp] = useState(0);
    const [catBudgets, setCatBudgets] = useState([]);
    
    // For setting new category budget
    const [selectedCat, setSelectedCat] = useState("อาหาร");
    const [catAmt, setCatAmt] = useState("");

    const [loading,  setLoading]  = useState(true);
    const [saving,   setSaving]   = useState(false);

    const loadData = async () => {
        if (!currentUser) return;
        try {
            const [budRes, summRes, todayRes, catBudRes] = await Promise.all([
                axios.get(`${API}/budget?userId=${currentUser.id}`),
                axios.get(`${API}/summary?userId=${currentUser.id}&month=${currentMonth}`),
                axios.get(`${API}/expenses/today?userId=${currentUser.id}`),
                axios.get(`${API}/budget/category?userId=${currentUser.id}&month=${currentMonth}`)
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
            if (catBudRes.data.success) setCatBudgets(catBudRes.data.data);
        } catch (err) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { loadData(); }, [currentUser]));

    const saveGlobalBudget = async () => {
        setSaving(true);
        try {
            await axios.post(`${API}/budget`, {
                userId: currentUser.id,
                dailyBudget: parseFloat(dailyBudget) || 0,
                monthlyBudget: parseFloat(monthlyBudget) || 0,
            });
            Alert.alert("สำเร็จ", "บันทึกงบหลักเรียบร้อย");
            loadData();
        } catch { Alert.alert("ผิดพลาด", "บันทึกไม่สำเร็จ"); }
        finally { setSaving(false); }
    };

    const saveCategoryBudget = async () => {
        if (!catAmt || parseFloat(catAmt) <= 0) return Alert.alert("แจ้งเตือน", "กรุณาระบุจำนวนเงิน");
        setSaving(true);
        try {
            await axios.post(`${API}/budget/category`, {
                userId: currentUser.id,
                category: selectedCat,
                amount: parseFloat(catAmt),
                month: currentMonth
            });
            setCatAmt("");
            Alert.alert("สำเร็จ", "บันทึกงบหมวดหมู่เรียบร้อย");
            loadData();
        } catch { Alert.alert("ผิดพลาด", "บันทึกไม่สำเร็จ"); }
        finally { setSaving(false); }
    };

    const db  = parseFloat(dailyBudget) || 0;
    const mb  = parseFloat(monthlyBudget) || 0;
    const me  = summary.totalExpense;
    const overDaily   = db > 0 && todayExp > db;
    const overMonthly = mb > 0 && me > mb;

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#21D07A" /></View>;

    return (
        <SafeAreaView style={s.safe}>
            <ScrollView contentContainerStyle={s.container}>
                <Text style={s.title}>งบประมาณ</Text>
                
                {/* ─── Global Budgets ─────────────────────────────────────── */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>ตั้งค่างบหลัก</Text>
                    <View style={s.inputRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.label}>รายวัน (฿)</Text>
                            <TextInput style={s.input} keyboardType="decimal-pad" value={dailyBudget} onChangeText={setDailyBudget} placeholder="0" placeholderTextColor="#556" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.label}>รายเดือน (฿)</Text>
                            <TextInput style={s.input} keyboardType="decimal-pad" value={monthlyBudget} onChangeText={setMonthlyBudget} placeholder="0" placeholderTextColor="#556" />
                        </View>
                    </View>
                    <TouchableOpacity style={s.btn} onPress={saveGlobalBudget}><Text style={s.btnTxt}>บันทึกงบหลัก</Text></TouchableOpacity>
                </View>

                {mb > 0 && (
                    <View style={s.statCard}>
                        <Text style={s.statTitle}>รายเดือน (ใช้แล้ว ฿{fmt(me)} / ฿{fmt(mb)})</Text>
                        <ProgressBar value={me} max={mb} color={overMonthly ? "#EF4444" : "#21D07A"} />
                    </View>
                )}
                {db > 0 && (
                    <View style={s.statCard}>
                        <Text style={s.statTitle}>รายวัน (วันนี้ ฿{fmt(todayExp)} / ฿{fmt(db)})</Text>
                        <ProgressBar value={todayExp} max={db} color={overDaily ? "#EF4444" : "#A78BFA"} />
                    </View>
                )}

                {/* ─── Category Budgets ─────────────────────────────────────── */}
                <Text style={[s.title, { marginTop: 20, fontSize: 22 }]}>งบตามหมวดหมู่</Text>
                <View style={s.card}>
                    <Text style={s.label}>เลือกหมวดหมู่</Text>
                    <View style={s.pickerWrapper}>
                        <Picker selectedValue={selectedCat} onValueChange={setSelectedCat} style={s.picker} dropdownIconColor="#A78BFA">
                            {CATEGORIES.map(c => <Picker.Item key={c} label={c} value={c} color="#fff" />)}
                        </Picker>
                    </View>
                    <Text style={s.label}>จำนวนเงิน (฿)</Text>
                    <TextInput style={s.input} keyboardType="decimal-pad" value={catAmt} onChangeText={setCatAmt} placeholder="0" placeholderTextColor="#556" />
                    <TouchableOpacity style={s.btnOutline} onPress={saveCategoryBudget}><Text style={s.btnOutlineTxt}>บันทึกงบหมวดหมู่</Text></TouchableOpacity>
                </View>

                {catBudgets.map(cb => {
                    const spentData = summary.byCategory.find(c => c.category === cb.category);
                    const spent = spentData ? Number(spentData.total) : 0;
                    const max = Number(cb.amount);
                    const over = spent > max;
                    return (
                        <View key={cb.category} style={s.statCard}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={s.statTitle}>{cb.category}</Text>
                                <Text style={s.statTitle}>฿{fmt(spent)} / ฿{fmt(max)}</Text>
                            </View>
                            <ProgressBar value={spent} max={max} color={over ? "#EF4444" : "#F59E0B"} />
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#060A13" },
    center: { flex: 1, backgroundColor: "#060A13", justifyContent: "center", alignItems: "center" },
    container: { padding: 24, paddingBottom: 40 },
    title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 20 },
    card: { backgroundColor: "#0F172A", borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#1E293B" },
    cardTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 16 },
    inputRow: { flexDirection: "row", gap: 12 },
    label: { color: "#94A3B8", fontSize: 14, fontWeight: "600", marginBottom: 8 },
    input: { backgroundColor: "rgba(23, 33, 58, 0.5)", color: "#fff", borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: "#1E293B" },
    btn: { backgroundColor: "#21D07A", borderRadius: 12, padding: 14, alignItems: "center" },
    btnTxt: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    pickerWrapper: { backgroundColor: "rgba(23, 33, 58, 0.5)", borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#1E293B", overflow: "hidden" },
    picker: { color: "#fff", height: 50 },
    btnOutline: { backgroundColor: "transparent", borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#A78BFA" },
    btnOutlineTxt: { color: "#A78BFA", fontWeight: "bold", fontSize: 16 },
    statCard: { backgroundColor: "#0F172A", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#1E293B" },
    statTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
});