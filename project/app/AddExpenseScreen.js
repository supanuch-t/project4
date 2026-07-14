import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import ResponsiveWrapper from "../components/ResponsiveWrapper";

const API = "http://10.0.2.2:3000/api";

const CATEGORIES_EXPENSE = [
    { label: "🍜 อาหาร", value: "อาหาร" }, { label: "🚌 เดินทาง", value: "เดินทาง" },
    { label: "🏠 ที่พัก", value: "ที่พัก" }, { label: "💊 สุขภาพ", value: "สุขภาพ" },
    { label: "🎮 บันเทิง", value: "บันเทิง" }, { label: "🛒 ช้อปปิ้ง", value: "ช้อปปิ้ง" },
    { label: "📌 อื่นๆ", value: "อื่นๆ" },
];
const CATEGORIES_INCOME = [
    { label: "💼 เงินเดือน", value: "เงินเดือน" }, { label: "💰 รายได้อื่น", value: "รายได้อื่น" },
    { label: "🎁 ของขวัญ", value: "ของขวัญ" }, { label: "📌 อื่นๆ", value: "อื่นๆ" },
];

export default function AddExpenseScreen() {
    const navigation = useNavigation();
    const { currentUser } = useAuth();

    const [type, setType]           = useState("expense");
    const [amount, setAmount]       = useState("");
    const [title, setTitle]         = useState("");
    const [category, setCategory]   = useState("อาหาร");
    const [date, setDate]           = useState(new Date().toISOString().split("T")[0]);
    const [note, setNote]           = useState("");
    const [image, setImage]         = useState(null);
    const [loading, setLoading]     = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    const categories = type === "expense" ? CATEGORIES_EXPENSE : CATEGORIES_INCOME;

    const simulateOCR = (uri) => {
        setImage(uri);
        setIsScanning(true);
        // Simulate network delay for OCR
        setTimeout(() => {
            setAmount("250");
            setCategory("อาหาร");
            setTitle("ใบเสร็จร้านอาหาร (สแกนอัตโนมัติ)");
            setIsScanning(false);
            Alert.alert("สแกนสำเร็จ", "ดึงข้อมูลจากใบเสร็จเรียบร้อยแล้ว");
        }, 2000);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") return Alert.alert("ต้องการสิทธิ์", "กรุณาอนุญาตการเข้าถึงรูปภาพ");
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", quality: 0.7 });
        if (!result.canceled) simulateOCR(result.assets[0].uri);
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") return Alert.alert("ต้องการสิทธิ์", "กรุณาอนุญาตการเข้าถึงกล้อง");
        const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
        if (!result.canceled) simulateOCR(result.assets[0].uri);
    };

    const handleSave = async () => {
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return Alert.alert("แจ้งเตือน", "กรุณากรอกจำนวนเงินให้ถูกต้อง");
        }
        if (!date) return Alert.alert("แจ้งเตือน", "กรุณาระบุวันที่");

        setLoading(true);
        try {
            const res = await axios.post(`${API}/expenses`, {
                userId: currentUser.id,
                title: title || category,
                amount: parseFloat(amount),
                type, category, note, date,
            });
            if (res.data.success) {
                Alert.alert("สำเร็จ", "บันทึกรายการเรียบร้อย", [{ text: "ตกลง", onPress: () => navigation.goBack() }]);
            } else Alert.alert("ผิดพลาด", res.data.message);
        } catch (err) {
            Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ResponsiveWrapper>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="always">
                    {/* Header */}
                    <View style={s.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={s.title}>บันทึกรายการ</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* OCR Banner */}
                    <View style={s.ocrBanner}>
                        <Ionicons name="scan" size={24} color="#A78BFA" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={s.ocrTitle}>สแกนใบเสร็จอัจฉริยะ</Text>
                            <Text style={s.ocrSub}>ถ่ายรูปใบเสร็จเพื่อดึงข้อมูลอัตโนมัติ</Text>
                        </View>
                        <View style={s.imageRow}>
                            <TouchableOpacity style={s.imgBtn} onPress={takePhoto}>
                                <Ionicons name="camera" size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={s.imgBtn} onPress={pickImage}>
                                <Ionicons name="image" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {isScanning && (
                        <View style={s.scanningOverlay}>
                            <ActivityIndicator size="large" color="#A78BFA" />
                            <Text style={s.scanningTxt}>กำลังวิเคราะห์ใบเสร็จ...</Text>
                        </View>
                    )}

                    {image && !isScanning && (
                        <View style={s.previewContainer}>
                            <Image source={{ uri: image }} style={s.receiptImg} />
                            <TouchableOpacity style={s.removeImg} onPress={() => setImage(null)}>
                                <Ionicons name="close-circle" size={28} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Type Toggle */}
                    <View style={s.typeRow}>
                        <TouchableOpacity
                            style={[s.typeBtn, type === "expense" && s.typeBtnExpense]}
                            onPress={() => { setType("expense"); setCategory("อาหาร"); }}
                        >
                            <Text style={[s.typeTxt, type === "expense" && s.typeTxtActive]}>💸 รายจ่าย</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.typeBtn, type === "income" && s.typeBtnIncome]}
                            onPress={() => { setType("income"); setCategory("เงินเดือน"); }}
                        >
                            <Text style={[s.typeTxt, type === "income" && s.typeTxtActive]}>💰 รายรับ</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Amount & Quick Buttons */}
                    <View style={s.amountCard}>
                        <Text style={s.amountLabel}>จำนวนเงิน (฿)</Text>
                        <TextInput
                            style={[s.amountInput, { color: type === "expense" ? "#EF4444" : "#21D07A" }]}
                            placeholder="0.00"
                            placeholderTextColor="#556"
                            keyboardType="decimal-pad"
                            value={amount}
                            onChangeText={setAmount}
                        />
                        <View style={s.quickAmounts}>
                            {[50, 100, 500, 1000].map(val => (
                                <TouchableOpacity key={val} style={s.quickBtn} onPress={() => setAmount(String(val))}>
                                    <Text style={s.quickTxt}>+{val}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Form Fields */}
                    <View style={s.section}>
                        <Text style={s.label}>หมวดหมู่</Text>
                        <View style={s.pickerWrapper}>
                            <Picker selectedValue={category} onValueChange={setCategory} style={s.picker} dropdownIconColor="#A78BFA">
                                {categories.map(c => <Picker.Item key={c.value} label={c.label} value={c.value} color="#fff" />)}
                            </Picker>
                        </View>

                        <Text style={s.label}>ชื่อรายการ</Text>
                        <TextInput style={s.input} placeholder="เช่น ข้าวผัด, BTS, ค่าน้ำ" placeholderTextColor="#556" value={title} onChangeText={setTitle} />

                        <Text style={s.label}>วันที่ (เปลี่ยนเป็นวันอื่นได้)</Text>
                        <TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor="#556" value={date} onChangeText={setDate} />

                        <Text style={s.label}>หมายเหตุ</Text>
                        <TextInput style={[s.input, { height: 80, textAlignVertical: "top" }]} placeholder="รายละเอียดเพิ่มเติม..." placeholderTextColor="#556" multiline value={note} onChangeText={setNote} />
                    </View>

                    <TouchableOpacity style={[s.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading || isScanning}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.saveTxt}>บันทึกรายการ</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </ResponsiveWrapper>
    );
}

const s = StyleSheet.create({
    container: { padding: 24, paddingBottom: 40 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center" },
    title: { color: "#fff", fontSize: 20, fontWeight: "bold" },
    ocrBanner: {
        flexDirection: "row", alignItems: "center", backgroundColor: "rgba(167, 139, 250, 0.15)",
        borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "rgba(167, 139, 250, 0.3)"
    },
    ocrTitle: { color: "#A78BFA", fontSize: 16, fontWeight: "bold" },
    ocrSub: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
    imageRow: { flexDirection: "row", gap: 8 },
    imgBtn: { backgroundColor: "#A78BFA", width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
    scanningOverlay: { backgroundColor: "#1E293B", borderRadius: 16, padding: 20, alignItems: "center", marginBottom: 20 },
    scanningTxt: { color: "#A78BFA", marginTop: 10, fontWeight: "600" },
    previewContainer: { position: "relative", marginBottom: 20 },
    receiptImg: { width: "100%", height: 150, borderRadius: 16 },
    removeImg: { position: "absolute", top: 10, right: 10 },
    typeRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
    typeBtn: { flex: 1, padding: 14, borderRadius: 16, backgroundColor: "#0F172A", alignItems: "center", borderWidth: 1, borderColor: "#1E293B" },
    typeBtnExpense: { backgroundColor: "rgba(239, 68, 68, 0.2)", borderColor: "#EF4444" },
    typeBtnIncome: { backgroundColor: "rgba(33, 208, 122, 0.2)", borderColor: "#21D07A" },
    typeTxt: { color: "#94A3B8", fontSize: 16, fontWeight: "600" },
    typeTxtActive: { color: "#fff" },
    amountCard: { backgroundColor: "#0F172A", borderRadius: 20, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: "#1E293B", alignItems: "center" },
    amountLabel: { color: "#94A3B8", fontSize: 14, marginBottom: 12 },
    amountInput: { fontSize: 48, fontWeight: "bold", textAlign: "center", minWidth: 150 },
    quickAmounts: { flexDirection: "row", gap: 10, marginTop: 20 },
    quickBtn: { backgroundColor: "#1E293B", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
    quickTxt: { color: "#fff", fontWeight: "600" },
    section: {},
    label: { color: "#AAB5D1", fontWeight: "600", fontSize: 14, marginBottom: 8 },
    input: { backgroundColor: "#0F172A", color: "#fff", borderRadius: 16, padding: 16, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: "#1E293B" },
    pickerWrapper: { backgroundColor: "#0F172A", borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: "#1E293B", overflow: "hidden" },
    picker: { color: "#fff", height: 56 },
    saveBtn: { backgroundColor: "#21D07A", borderRadius: 16, padding: 18, alignItems: "center", marginTop: 10, shadowColor: "#21D07A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
    saveTxt: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});