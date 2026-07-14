import React, { useState } from 'react';
import {
    StyleSheet, Text, TextInput, TouchableOpacity, View,
    Alert, KeyboardAvoidingView, Platform, ScrollView,
    ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import ResponsiveWrapper from '../components/ResponsiveWrapper';
import ParticleBackground from '../components/ParticleBackground';

const API = "http://10.0.2.2:3000/api";

export default function LoginScreen({ navigation }) {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading]   = useState(false);
    const { login } = useAuth();

    const handleLogin = async (overrideEmail, overridePass) => {
        const mail = overrideEmail || email;
        const pass = overridePass || password;
        if (!mail || !pass) {
            Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลและรหัสผ่าน");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(`${API}/login`, { email: mail, password: pass });
            if (res.data.success) {
                await login(res.data.user);
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

    const handleDemo = async () => {
        // Pre-fill and auto-login with a demo account if one exists, 
        // or just mock the login session
        const demoUser = { id: 999, username: "Demo User", email: "demo@example.com" };
        await login(demoUser);
        navigation.replace("Home");
    };

    return (
        <ResponsiveWrapper>
            <ParticleBackground />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="always">
                    <View style={s.logoArea}>
                        <View style={s.logoCircle}>
                            <Ionicons name="wallet" size={40} color="#fff" />
                        </View>
                        <Text style={s.appName}>Expense Tracker</Text>
                        <Text style={s.appSub}>ควบคุมการใช้จ่ายของคุณอย่างชาญฉลาด</Text>
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

                        <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={() => handleLogin()} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>เข้าสู่ระบบ</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={s.demoBtn} onPress={handleDemo} disabled={loading}>
                            <Ionicons name="play-circle-outline" size={20} color="#A78BFA" />
                            <Text style={s.demoBtnText}>ทดลองใช้งาน (Demo Mode)</Text>
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
        </ResponsiveWrapper>
    );
}

const s = StyleSheet.create({
    container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 1 },
    logoArea: { alignItems: 'center', marginBottom: 32 },
    logoCircle: {
        width: 80, height: 80, borderRadius: 22,
        backgroundColor: "rgba(33, 208, 122, 0.2)",
        justifyContent: "center", alignItems: "center", marginBottom: 20,
        borderWidth: 1, borderColor: "rgba(33, 208, 122, 0.5)",
    },
    appName: { fontSize: 34, fontWeight: 'bold', color: '#fff' },
    appSub: { color: "#8F9BB3", fontSize: 15, marginTop: 8, marginBottom: 10 },
    card: { width: '100%', padding: 4 },
    label: { color: "#AAB5D1", marginBottom: 8, fontWeight: "600", fontSize: 14 },
    input: {
        backgroundColor: "rgba(23, 33, 58, 0.8)", color: "#fff", borderRadius: 14,
        padding: 16, fontSize: 16, marginBottom: 18,
        borderWidth: 1, borderColor: "rgba(35, 48, 79, 0.8)",
    },
    eyeBtn: { position: 'absolute', right: 14, top: 14 },
    btn: {
        backgroundColor: "#21D07A", borderRadius: 14,
        padding: 18, alignItems: "center", marginTop: 6,
        shadowColor: "#21D07A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    demoBtn: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        marginTop: 16, padding: 16, borderRadius: 14,
        backgroundColor: "rgba(167, 139, 250, 0.1)",
        borderWidth: 1, borderColor: "rgba(167, 139, 250, 0.3)", gap: 8
    },
    demoBtnText: { color: "#A78BFA", fontWeight: "bold", fontSize: 16 },
    row: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    grayText: { color: '#888', fontSize: 14 },
    linkText: { color: "#21D07A", fontWeight: "bold", fontSize: 14 },
});