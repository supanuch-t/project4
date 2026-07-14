import React, { useEffect, useState, useCallback } from "react";
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, Modal
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useAuth } from "./context/AuthContext";

const API = "http://10.0.2.2:3000/api";
const CATEGORY_ICONS = {
    "อาหาร": "🍜", "เดินทาง": "🚌", "ที่พัก": "🏠", "สุขภาพ": "💊",
    "บันเทิง": "🎮", "ช้อปปิ้ง": "🛒", "อื่นๆ": "📌",
    "เงินเดือน": "💼", "รายได้อื่น": "💰",
};

function fmt(n) { return Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 }); }

export default function HistoryScreen() {
    const { currentUser } = useAuth();
    
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("all"); // all, expense, income
    
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

    const loadData = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API}/expenses?userId=${currentUser.id}&month=${month}`);
            if (res.data.success) setExpenses(res.data.data);
        } catch (err) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { loadData(); }, [currentUser, month]));

    const handleDelete = (id) => {
        Alert.alert("ยืนยันการลบ", "คุณต้องการลบรายการนี้ใช่หรือไม่?", [
            { text: "ยกเลิก", style: "cancel" },
            {
                text: "ลบ", style: "destructive",
                onPress: async () => {
                    try {
                        const res = await axios.delete(`${API}/expenses/${id}`);
                        if (res.data.success) {
                            Alert.alert("สำเร็จ", "ลบรายการเรียบร้อย");
                            loadData();
                        } else Alert.alert("ผิดพลาด", res.data.message);
                    } catch (err) {
                        Alert.alert("ผิดพลาด", "ไม่สามารถลบรายการได้");
                    }
                }
            }
        ]);
    };

    // Filter logic
    const filteredExpenses = expenses.filter(item => {
        const matchSearch = (item.title || "").toLowerCase().includes(search.toLowerCase()) || 
                            (item.category || "").toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === "all" || item.type === filterType;
        return matchSearch && matchType;
    });

    const addMonths = (dateStr, delta) => {
        const d = new Date(dateStr + "-01");
        d.setMonth(d.getMonth() + delta);
        return d.toISOString().slice(0, 7);
    };
    
    const monthLabel = (m) => new Date(m + "-01").toLocaleDateString("th-TH", { month: "long", year: "numeric" });

    return (
        <View style={s.container}>
            {/* Header / Month Selector */}
            <View style={s.header}>
                <Text style={s.title}>ประวัติรายการ</Text>
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

            {/* Search & Filters */}
            <View style={s.filterRow}>
                <View style={s.searchBox}>
                    <Ionicons name="search" size={20} color="#94A3B8" />
                    <TextInput
                        style={s.searchInput}
                        placeholder="ค้นหารายการ..."
                        placeholderTextColor="#94A3B8"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <View style={s.pickerWrapper}>
                    <Picker
                        selectedValue={filterType}
                        onValueChange={setFilterType}
                        style={s.picker}
                        dropdownIconColor="#A78BFA"
                    >
                        <Picker.Item label="ทั้งหมด" value="all" color="#fff" />
                        <Picker.Item label="รายจ่าย" value="expense" color="#fff" />
                        <Picker.Item label="รายรับ" value="income" color="#fff" />
                    </Picker>
                </View>
            </View>

            {loading ? (
                <View style={s.loadingContainer}><ActivityIndicator size="large" color="#21D07A" /></View>
            ) : (
                <FlatList
                    data={filteredExpenses}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={s.listContent}
                    ListEmptyComponent={() => (
                        <View style={s.empty}>
                            <Text style={s.emptyIcon}>📭</Text>
                            <Text style={s.emptyTxt}>ไม่พบรายการ</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <View style={s.txCard}>
                            <View style={[s.txIcon, { backgroundColor: item.type === "income" ? "rgba(33,208,122,0.15)" : "rgba(239,68,68,0.15)" }]}>
                                <Text style={{ fontSize: 20 }}>{CATEGORY_ICONS[item.category] || "📌"}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.txTitle} numberOfLines={1}>{item.title || item.category}</Text>
                                <Text style={s.txSub}>{item.category} • {item.date?.slice(0, 10)}</Text>
                            </View>
                            <Text style={[s.txAmt, { color: item.type === "income" ? "#21D07A" : "#EF4444" }]}>
                                {item.type === "income" ? "+" : "-"}฿ {fmt(item.amount)}
                            </Text>
                            <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(item.id)}>
                                <Ionicons name="trash" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#060A13" },
    header: { padding: 24, paddingBottom: 16, backgroundColor: "#0B1120", borderBottomWidth: 1, borderBottomColor: "#1E293B" },
    title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 16 },
    monthBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#0F172A", borderRadius: 16, padding: 8, borderWidth: 1, borderColor: "#1E293B" },
    navBtn: { padding: 8 },
    monthTxt: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    filterRow: { flexDirection: "row", gap: 12, padding: 20, zIndex: 10 },
    searchBox: { flex: 2, flexDirection: "row", alignItems: "center", backgroundColor: "#0F172A", borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "#1E293B" },
    searchInput: { flex: 1, color: "#fff", paddingVertical: 12, marginLeft: 8 },
    pickerWrapper: { flex: 1, backgroundColor: "#0F172A", borderRadius: 12, borderWidth: 1, borderColor: "#1E293B", overflow: "hidden", justifyContent: "center" },
    picker: { color: "#fff", height: 50 },
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    txCard: {
        backgroundColor: "#0F172A", borderRadius: 16, padding: 16, marginBottom: 12,
        flexDirection: "row", alignItems: "center", gap: 12,
        borderWidth: 1, borderColor: "#1E293B",
    },
    txIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: "center", alignItems: "center" },
    txTitle: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 4 },
    txSub: { color: "#94A3B8", fontSize: 12 },
    txAmt: { fontSize: 16, fontWeight: "bold", marginRight: 8 },
    deleteBtn: { padding: 8, backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: 10 },
    empty: { alignItems: "center", paddingVertical: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyTxt: { color: "#94A3B8", fontSize: 16 },
});
