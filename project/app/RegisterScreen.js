import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, Alert, Image,
    StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
    ActivityIndicator,
} from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import ResponsiveWrapper from "../components/ResponsiveWrapper";
import ParticleBackground from "../components/ParticleBackground";

const API = "http://10.0.2.2:3000/api";

export default function RegisterScreen({ navigation }) {
    const [forms, setForms] = useState({ name: "", email: "", username: "", password: "", confirmPassword: "", image: null });
    const [showPass, setShowPass]    = useState(false);
    const [showConf, setShowConf]    = useState(false);
    const [loading, setLoading]      = useState(false);

    const handleRegister = async () => {
        if (!forms.name || !forms.email || !forms.username || !forms.password) {
            return Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบ");
        }
        if (forms.password !== forms.confirmPassword) {
            return Alert.alert("แจ้งเตือน", "รหัสผ่านต้องตรงกัน");
        }
        setLoading(true);
        try {
            const res = await axios.post(`${API}/register`, {
                username: forms.username,
                email: forms.email,
                password: forms.password,
            });
            if (res.data.success) {
                Alert.alert("สำเร็จ", "สมัครสมาชิกเรียบร้อย", [
                    { text: "ตกลง", onPress: () => navigation.navigate("Login") },
                ]);
            } else {
                Alert.alert("ผิดพลาด", res.data.message);
            }
        } catch {
            Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดในการสมัครสมาชิก");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ResponsiveWrapper>
            <ParticleBackground />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="always">
                    <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    <Text style={s.title}>สร้างบัญชีใหม่</Text>
                    <Text style={s.subtitle}>เริ่มบันทึกและวิเคราะห์ค่าใช้จ่ายของคุณ</Text>

                    <View style={s.form}>
                        <Text style={s.label}>ชื่อ-นามสกุล</Text>
                        <TextInput style={s.input} placeholder="ชื่อ นามสกุล" placeholderTextColor="#556" value={forms.name} onChangeText={t => setForms({ ...forms, name: t })} />

                        <Text style={s.label}>อีเมล</Text>
                        <TextInput style={s.input} placeholder="example@email.com" placeholderTextColor="#556" keyboardType="email-address" autoCapitalize="none" onChangeText={t => setForms({ ...forms, email: t })} />

                        <Text style={s.label}>ชื่อผู้ใช้</Text>
                        <TextInput style={s.input} placeholder="username" placeholderTextColor="#556" autoCapitalize="none" onChangeText={t => setForms({ ...forms, username: t })} />

                        <Text style={s.label}>รหัสผ่าน</Text>
                        <View>
                            <TextInput style={s.input} placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)" placeholderTextColor="#556" secureTextEntry={!showPass} onChangeText={t => setForms({ ...forms, password: t })} />
                            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(v => !v)}>
                                <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color="#bbb" />
                            </TouchableOpacity>
                        </View>

                        <Text style={s.label}>ยืนยันรหัสผ่าน</Text>
                        <View>
                            <TextInput style={s.input} placeholder="ยืนยันรหัสผ่านอีกครั้ง" placeholderTextColor="#556" secureTextEntry={!showConf} onChangeText={t => setForms({ ...forms, confirmPassword: t })} />
                            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowConf(v => !v)}>
                                <Ionicons name={showConf ? "eye-off-outline" : "eye-outline"} size={20} color="#bbb" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>สมัครสมาชิก</Text>}
                        </TouchableOpacity>

                        <View style={s.row}>
                            <Text style={s.grayText}>มีบัญชีแล้ว? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                <Text style={s.linkText}>เข้าสู่ระบบ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ResponsiveWrapper>
    );
}

const s = StyleSheet.create({
    container: { flexGrow: 1, padding: 24, paddingTop: 40, zIndex: 1 },
    backBtn: { marginBottom: 16, width: 40 },
    title: { fontSize: 32, fontWeight: "bold", color: "#fff", marginBottom: 6 },
    subtitle: { color: "#8F9BB3", fontSize: 15, marginBottom: 32 },
    form: {},
    label: { color: "#AAB5D1", marginBottom: 8, fontWeight: "600", fontSize: 14 },
    input: {
        backgroundColor: "rgba(23, 33, 58, 0.8)", color: "#fff", borderRadius: 14,
        padding: 16, fontSize: 16, marginBottom: 16,
        borderWidth: 1, borderColor: "rgba(35, 48, 79, 0.8)",
    },
    eyeBtn: { position: "absolute", right: 14, top: 14 },
    btn: {
        backgroundColor: "#21D07A", borderRadius: 14,
        padding: 18, alignItems: "center", marginTop: 12,
        shadowColor: "#21D07A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    btnText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
    row: { flexDirection: "row", justifyContent: "center", marginTop: 30, marginBottom: 32 },
    grayText: { color: "#888", fontSize: 14 },
    linkText: { color: "#21D07A", fontWeight: "bold", fontSize: 14 },
});