import React, { useState, useCallback } from "react";
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, Alert, ActivityIndicator, TextInput, Switch
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const API = "http://10.0.2.2:3000/api";
function fmt(n) { return Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 }); }

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { currentUser, logout, login } = useAuth();

    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
    const [settings, setSettings] = useState({ username: "", alert_threshold: "1000", push_enabled: true });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const currentMonth = new Date().toISOString().slice(0, 7);

    const loadData = async () => {
        if (!currentUser) return;
        try {
            const [summRes, userRes] = await Promise.all([
                axios.get(`${API}/summary?userId=${currentUser.id}&month=${currentMonth}`),
                axios.get(`${API}/users/${currentUser.id}`)
            ]);
            if (summRes.data.success) setSummary(summRes.data.data);
            if (userRes.data?.success) {
                const u = userRes.data.data;
                setSettings({
                    username: u.username,
                    alert_threshold: String(u.alert_threshold),
                    push_enabled: u.push_enabled === 1
                });
            }
        } catch {/* ignore */}
        finally { setLoading(false); }
    };

    useFocusEffect(useCallback(() => { loadData(); }, [currentUser]));

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await axios.put(`${API}/users/${currentUser.id}`, {
                username: settings.username,
                alert_threshold: parseFloat(settings.alert_threshold) || 1000,
                push_enabled: settings.push_enabled ? 1 : 0
            });
            if (res.data.success) {
                Alert.alert("สำเร็จ", "อัปเดตข้อมูลส่วนตัวเรียบร้อย");
                setEditMode(false);
                // update local context gently
                login({ ...currentUser, username: settings.username }); 
            } else Alert.alert("ผิดพลาด", res.data.message);
        } catch { Alert.alert("ผิดพลาด", "ไม่สามารถอัปเดตได้"); }
        finally { setSaving(false); }
    };

    const handleLogout = () => {
        Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบหรือไม่?", [
            { text: "ยกเลิก", style: "cancel" },
            { text: "ออกจากระบบ", style: "destructive", onPress: async () => { await logout(); navigation.replace("Login"); } },
        ]);
    };

    const initials = (settings.username || currentUser?.username || "U").slice(0, 2).toUpperCase();

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#21D07A" /></View>;

    return (
        <SafeAreaView style={s.safe}>
            <ScrollView contentContainerStyle={s.container}>
                {/* Header Profile */}
                <View style={s.profileHeader}>
                    <View style={s.avatarCircle}><Text style={s.initials}>{initials}</Text></View>
                    <Text style={s.name}>{settings.username || "ผู้ใช้งาน"}</Text>
                    <Text style={s.email}>{currentUser?.email}</Text>
                </View>

                {/* Monthly Summary mini-card */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>สรุปยอดเดือนนี้</Text>
                    <View style={s.statsRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.statLabel}>รายรับ</Text>
                            <Text style={[s.statVal, { color: "#21D07A" }]}>+฿{fmt(summary.totalIncome)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.statLabel}>รายจ่าย</Text>
                            <Text style={[s.statVal, { color: "#EF4444" }]}>-฿{fmt(summary.totalExpense)}</Text>
                        </View>
                    </View>
                </View>

                {/* Settings & Profile Edit */}
                <View style={s.card}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <Text style={s.cardTitle}>ตั้งค่าบัญชี</Text>
                        <TouchableOpacity onPress={() => setEditMode(!editMode)}>
                            <Ionicons name={editMode ? "close" : "create-outline"} size={24} color="#A78BFA" />
                        </TouchableOpacity>
                    </View>

                    {editMode ? (
                        <View>
                            <Text style={s.label}>ชื่อผู้ใช้</Text>
                            <TextInput style={s.input} value={settings.username} onChangeText={t => setSettings({...settings, username: t})} />
                            
                            <Text style={s.label}>แจ้งเตือนรายการใหญ่ (บาท)</Text>
                            <TextInput style={s.input} keyboardType="decimal-pad" value={settings.alert_threshold} onChangeText={t => setSettings({...settings, alert_threshold: t})} />
                            
                            <View style={s.switchRow}>
                                <Text style={s.label}>เปิดรับการแจ้งเตือน</Text>
                                <Switch value={settings.push_enabled} onValueChange={v => setSettings({...settings, push_enabled: v})} trackColor={{ false: "#1E293B", true: "#21D07A" }} />
                            </View>

                            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveTxt}>บันทึกการตั้งค่า</Text>}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <View style={s.infoRow}>
                                <Text style={s.infoLabel}>แจ้งเตือนรายการใหญ่</Text>
                                <Text style={s.infoVal}>฿{fmt(settings.alert_threshold)}</Text>
                            </View>
                            <View style={s.infoRow}>
                                <Text style={s.infoLabel}>การแจ้งเตือน</Text>
                                <Text style={[s.infoVal, { color: settings.push_enabled ? "#21D07A" : "#EF4444" }]}>
                                    {settings.push_enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                    <Text style={s.logoutTxt}>ออกจากระบบ</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#060A13" },
    center: { flex: 1, backgroundColor: "#060A13", justifyContent: "center", alignItems: "center" },
    container: { padding: 24, paddingBottom: 40 },
    profileHeader: { alignItems: "center", marginBottom: 30 },
    avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(167, 139, 250, 0.2)", justifyContent: "center", alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: "rgba(167, 139, 250, 0.5)" },
    initials: { color: "#fff", fontSize: 32, fontWeight: "bold" },
    name: { color: "#fff", fontSize: 24, fontWeight: "bold" },
    email: { color: "#94A3B8", fontSize: 15, marginTop: 4 },
    card: { backgroundColor: "#0F172A", borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "#1E293B" },
    cardTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    statsRow: { flexDirection: "row", marginTop: 16, gap: 12 },
    statLabel: { color: "#94A3B8", fontSize: 14, marginBottom: 4 },
    statVal: { fontSize: 22, fontWeight: "bold" },
    label: { color: "#94A3B8", fontSize: 14, fontWeight: "600", marginBottom: 8 },
    input: { backgroundColor: "rgba(23, 33, 58, 0.5)", color: "#fff", borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: "#1E293B" },
    switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    saveBtn: { backgroundColor: "#21D07A", borderRadius: 14, padding: 16, alignItems: "center" },
    saveTxt: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#1E293B" },
    infoLabel: { color: "#94A3B8", fontSize: 15 },
    infoVal: { color: "#fff", fontSize: 15, fontWeight: "600" },
    logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.3)" },
    logoutTxt: { color: "#EF4444", fontSize: 17, fontWeight: "bold" },
});