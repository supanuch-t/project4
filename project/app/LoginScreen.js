import React, { useState } from 'react';
import {
    StyleSheet, Text, TextInput, TouchableOpacity, View,
    Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
    ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from './context/AuthContext';

const API = "http://10.0.2.2:3000/api";

export default function LoginScreen({ navigation }) {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading]   = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลและรหัสผ่าน");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(`${API}/login`, { email, password });
            if (res.data.success) {
                await login(res.data.user);        // บันทึก session
                navigation.replace("Home");
            } else {
                Alert.alert("เข้าสู่ระบบไม่สำเร็จ", res.data.message);
            }
        } catch (err) {
            Alert.alert("Error", err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={s.safe}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="always">
                    <View style={s.logoArea}>
                        <View style={s.logoCircle}>
                            <Image
                                source={require("../../assets/logo.png")}
                                style={s.logoImage}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={s.appName}>Expense Tracker</Text>
                        <Text style={s.title2}>ยินดีต้อนรับ</Text>
                        <Text style={s.appSub}>ติดตามค่าใช้จ่ายของคุณ</Text>
                    </View>

                    <View style={s.card}>
                        <Text style={s.label}>อีเมล</Text>
                        <TextInput
                            style={s.input}
                            placeholder="example@email.com"
                            placeholderTextColor="#556"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <Text style={s.label}>รหัสผ่าน</Text>
                        <View>
                            <TextInput
                                style={s.input}
                                placeholder="รหัสผ่าน"
                                placeholderTextColor="#556"
                                secureTextEntry={!showPass}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(v => !v)}>
                                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#bbb" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>เข้าสู่ระบบ</Text>}
                        </TouchableOpacity>

                        <View style={s.row}>
                            <Text style={s.grayText}>ยังไม่มีบัญชี? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                                <Text style={s.linkText}>สมัครสมาชิก</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#0B1120' },
    container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    logoArea: { alignItems: 'center', marginBottom: 32 },
    logoCircle: {
        width: 80, height: 80, borderRadius: 22,
        backgroundColor: "#21D07A",
        justifyContent: "center", alignItems: "center", marginBottom: 20,
    },
    logoImage: { width: 60, height: 60 },
    appName: { fontSize: 34, fontWeight: 'bold', color: '#fff' },
    title2: { color: "#fff", fontSize: 20, fontWeight: "600", marginTop: 8 },
    appSub: { color: "#8F9BB3", fontSize: 15, marginTop: 6, marginBottom: 30 },
    card: { width: '100%', padding: 4 },
    label: { color: "#AAB5D1", marginBottom: 8, fontWeight: "600", fontSize: 14 },
    input: {
        backgroundColor: "#17213A", color: "#fff", borderRadius: 14,
        padding: 16, fontSize: 16, marginBottom: 18,
        borderWidth: 1, borderColor: "#23304F",
    },
    eyeBtn: { position: 'absolute', right: 14, top: 14 },
    btn: {
        backgroundColor: "#21D07A", borderRadius: 14,
        padding: 18, alignItems: "center", marginTop: 6,
    },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    row: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    grayText: { color: '#888', fontSize: 14 },
    linkText: { color: "#21D07A", fontWeight: "bold", fontSize: 14 },
});