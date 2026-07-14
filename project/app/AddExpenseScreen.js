import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    SafeAreaView, ScrollView, KeyboardAvoidingView, Platform,
    Alert, Image, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const API = "http://10.0.2.2:3000/api";

const CATEGORIES_EXPENSE = [
    { label: "🍜 อาหาร", value: "อาหาร" },
    { label: "🚌 เดินทาง", value: "เดินทาง" },
    { label: "🏠 ที่พัก", value: "ที่พัก" },
    { label: "💊 สุขภาพ", value: "สุขภาพ" },
    { label: "🎮 บันเทิง", value: "บันเทิง" },
    { label: "🛒 ช้อปปิ้ง", value: "ช้อปปิ้ง" },
    { label: "📌 อื่นๆ", value: "อื่นๆ" },
];
const CATEGORIES_INCOME = [
    { label: "💼 เงินเดือน", value: "เงินเดือน" },
    { label: "💰 รายได้อื่น", value: "รายได้อื่น" },
    { label: "🎁 ของขวัญ", value: "ของขวัญ" },
    { label: "📌 อื่นๆ", value: "อื่นๆ" },
];

function todayStr() {
    return new Date().toISOString().split("T")[0];
}

export default function AddExpenseScreen() {
    const navigation    = useNavigation();
    const { currentUser } = useAuth();

    const [type, setType]           = useState("expense");
    const [amount, setAmount]       = useState("");
    const [title, setTitle]         = useState("");
    const [category, setCategory]   = useState("อาหาร");
    const [date, setDate]           = useState(todayStr());
    const [note, setNote]           = useState("");
    const [image, setImage]         = useState(null);
    const [loading, setLoading]     = useState(false);

    const categories = type === "expense" ? CATEGORIES_EXPENSE : CATEGORIES_INCOME;

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("ต้องการสิทธิ์", "กรุณาอนุญาตการเข้าถึงรูปภาพ");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: false,
            quality: 0.7,
        });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("ต้องการสิทธิ์", "กรุณาอนุญาตการเข้าถึงกล้อง");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.7,
        });
        if (!result.canceled) setImage(result.assets[0].uri);
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
                type,
                category,
                note,
                date,
            });
            if (res.data.success) {
                Alert.alert("สำเร็จ", "บันทึกรายการเรียบร้อย", [
                    { text: "ตกลง", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("ผิดพลาด", res.data.message);
            }
        } catch (err) {
            Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={s.safe}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="always">
                    {/* Header */}
                    <View style={s.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={26} color="#fff" />
                        </TouchableOpacity>
                        <Text style={s.title}>บันทึกรายการ</Text>
                        <View style={{ width: 26 }} />
                    </View>

                    {/* Type Toggle */}
                    <View style={s.typeRow}>
                        {[
                            { key: "expense", label: "💸 รายจ่าย" },
                            { key: "income",  label: "💰 รายรับ" },
                        ].map(t => (
                            <TouchableOpacity
                                key={t.key}
                                style={[s.typeBtn, type === t.key && s.typeBtnActive]}
                                onPress={() => { setType(t.key); setCategory(t.key === "expense" ? "อาหาร" : "เงินเดือน"); }}
                            >
                                <Text style={[s.typeTxt, type === t.key && s.typeTxtActive]}>
                                    {t.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Amount */}
                    <View style={s.amountCard}>
                        <Text style={s.amountLabel}>จำนวนเงิน (฿)</Text>
                        <TextInput
                            style={s.amountInput}
                            placeholder="0.00"
                            placeholderTextColor="#556"
                            keyboardType="decimal-pad"
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>

                    {/* Form Fields */}
                    <View style={s.section}>
                        <Text style={s.label}>ชื่อรายการ</Text>
                        <TextInput
                            style={s.input}
                            placeholder="เช่น ข้าวผัด, BTS, ค่าน้ำ"
                            placeholderTextColor="#556"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={s.label}>หมวดหมู่</Text>
                        <View style={s.pickerWrapper}>
                            <Picker
                                selectedValue={category}
                                onValueChange={setCategory}
                                style={s.picker}
                                dropdownIconColor="#8F9BB3"
                            >
                                {categories.map(c => (
                                    <Picker.Item key={c.value} label={c.label} value={c.value} color="#fff" />
                                ))}
                            </Picker>
                        </View>

                        <Text style={s.label}>วันที่</Text>
                        <TextInput
                            style={s.input}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#556"
                            value={date}
                            onChangeText={setDate}
                        />
                        <Text style={s.hint}>รองรับการบันทึกย้อนหลัง (ใส่วันที่ในอดีตได้)</Text>

                        <Text style={s.label}>หมายเหตุ</Text>
                        <TextInput
                            style={[s.input, { height: 80, textAlignVertical: "top" }]}
                            placeholder="รายละเอียดเพิ่มเติม..."
                            placeholderTextColor="#556"
                            multiline
                            value={note}
                            onChangeText={setNote}
                        />

                        {/* Receipt Image */}
                        <Text style={s.label}>ใบเสร็จ / หลักฐาน</Text>
                        <View style={s.imageRow}>
                            <TouchableOpacity style={s.imgBtn} onPress={takePhoto}>
                                <Ionicons name="camera" size={22} color="#21D07A" />
                                <Text style={s.imgBtnText}>ถ่ายรูป</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.imgBtn} onPress={pickImage}>
                                <Ionicons name="image" size={22} color="#21D07A" />
                                <Text style={s.imgBtnText}>เลือกรูป</Text>
                            </TouchableOpacity>
                        </View>
                        {image && (
                            <View style={{ position: "relative" }}>
                                <Image source={{ uri: image }} style={s.receiptImg} resizeMode="cover" />
                                <TouchableOpacity style={s.removeImg} onPress={() => setImage(null)}>
                                    <Ionicons name="close-circle" size={26} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity style={[s.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                                <Text style={s.saveTxt}>บันทึกรายการ</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#0B1120" },
    container: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
    title: { color: "#fff", fontSize: 20, fontWeight: "bold" },
    typeRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
    typeBtn: {
        flex: 1, padding: 14, borderRadius: 14,
        backgroundColor: "#17213A", alignItems: "center",
        borderWidth: 1, borderColor: "#23304F",
    },
    typeBtnActive: { backgroundColor: "#21D07A", borderColor: "#21D07A" },
    typeTxt: { color: "#8F9BB3", fontSize: 16, fontWeight: "600" },
    typeTxtActive: { color: "#fff" },
    amountCard: {
        backgroundColor: "#17213A", borderRadius: 18, padding: 20,
        marginBottom: 20, borderWidth: 1, borderColor: "#23304F",
        alignItems: "center",
    },
    amountLabel: { color: "#8F9BB3", fontSize: 14, marginBottom: 8 },
    amountInput: {
        color: "#21D07A", fontSize: 42, fontWeight: "bold",
        textAlign: "center", minWidth: 150,
    },
    section: {},
    label: { color: "#AAB5D1", fontWeight: "600", fontSize: 14, marginBottom: 8 },
    input: {
        backgroundColor: "#17213A", color: "#fff", borderRadius: 14,
        padding: 14, fontSize: 15, marginBottom: 16,
        borderWidth: 1, borderColor: "#23304F",
    },
    hint: { color: "#556", fontSize: 12, marginTop: -12, marginBottom: 16 },
    pickerWrapper: {
        backgroundColor: "#17213A", borderRadius: 14, marginBottom: 16,
        borderWidth: 1, borderColor: "#23304F", overflow: "hidden",
    },
    picker: { color: "#fff", height: 52 },
    imageRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
    imgBtn: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 8, backgroundColor: "#17213A", borderRadius: 12, padding: 14,
        borderWidth: 1, borderColor: "#21D07A44",
    },
    imgBtnText: { color: "#21D07A", fontSize: 14, fontWeight: "600" },
    receiptImg: { width: "100%", height: 200, borderRadius: 14, marginBottom: 16 },
    removeImg: { position: "absolute", top: 8, right: 8 },
    saveBtn: {
        backgroundColor: "#21D07A", borderRadius: 16, padding: 18,
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 10, marginTop: 8,
        shadowColor: "#21D07A", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
    },
    saveTxt: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});