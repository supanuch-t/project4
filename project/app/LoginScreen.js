import React, { useState } from 'react';
import {
  StyleSheet, Text, TextInput, TouchableOpacity, View,
  Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";

export default function Login({ navigation, setCurrentUser, setAppData }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [User, setUser]         = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
        Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลและรหัสผ่าน");
        return;
    }

    try {
        const res = await axios.post("http://10.0.2.2:3000/api/login", {
            email,
            password
        });

        if (res.data.success) {
            Alert.alert("สำเร็จ", "เข้าสู่ระบบสำเร็จ");
            navigation.navigate("Home");
        } else {
            Alert.alert("เข้าสู่ระบบไม่สำเร็จ", res.data.message);
        }

    } catch (err) {
        console.log(err.response?.data);
        console.log(err.message);

      Alert.alert(
          "Error",
          err.response?.data?.message || err.message
      );
    }
  };

  {/*const handleLogin = async () => {
    if (!email || !password) { Alert.alert('แจ้งเตือน', 'กรุณากรอกอีเมลและรหัสผ่าน'); return; }
    setLoading(true);
    try {
      // ── Firebase Auth Login ──
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid  = cred.user.uid;

      // ── โหลด profile จาก Firestore ──
      const snap = await getDoc(doc(db, 'users', uid));
      const profile = snap.exists() ? snap.data() : {};
      setCurrentUser({ uid, email: cred.user.email, ...profile });

      // ── โหลด appData ──
      const dataSnap = await getDoc(doc(db, 'users', uid, 'appData', 'main'));
      if (dataSnap.exists() && setAppData) setAppData(dataSnap.data());

    } catch (error) {
      const msg = error.code === 'auth/invalid-credential'
        ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
        : 'เกิดข้อผิดพลาด กรุณาลองใหม่';
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', msg);
    } finally {
      setLoading(false);
    }
  };*/}

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="always">
          <View style={s.logoArea}>
            {/*<View style={s.logoCircle}>
              <Ionicons name="pie-chart" size={50} color="#fff" />
            </View>*/}
            <View style={s.logoCircle}>
              <Image source={require("../../assets/logo.png")}style={s.logoImage}
              resizeMode="contain"/>
            </View>
            <Text style={s.appName}>Expense Tracker</Text>
            <Text style={s.title2}>ยินดีต้อนรับ</Text>
            <Text style={s.appSub}>ติดตามค่าใช้จ่ายของคุณ</Text>
          </View>

          <View style={s.card}>
            

            <Text style={s.label}>อีเมล</Text>
            <TextInput
              style={s.input} placeholder="example@email.com" placeholderTextColor="#ddd"
              keyboardType="email-address" autoCapitalize="none"
              value={email} onChangeText={setEmail}
            />

            <Text style={s.label}>รหัสผ่าน</Text>
            <View>
              <TextInput
                style={s.input} placeholder="รหัสผ่าน" placeholderTextColor="#ddd"
                secureTextEntry={!showPass} value={password} onChangeText={setPassword}
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(v => !v)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#bbb" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
    style={[s.btn, loading && { opacity: 0.7 }]}
    onPress={handleLogin}
    disabled={loading}
>
    {loading ? (
        <ActivityIndicator color="#fff" />
    ) : (
        <Text style={s.btnText}>เข้าสู่ระบบ</Text>
    )}
</TouchableOpacity>
            <TouchableOpacity
                style={s.googleBtn}onPress={() => Alert.alert("Google Login", "ยังไม่ได้พัฒนาฟังก์ชันนี้")}>
                <Ionicons name="logo-google"size={22}color="#fff"/>
                <Text style={s.googleText}>เข้าสู่ระบบด้วย Google</Text>
            </TouchableOpacity>

            <View style={s.row}>
              <Text style={s.grayText}>ยังไม่มีบัญชี? </Text>
              <TouchableOpacity
  onPress={() => {
    console.log(navigation);
    navigation.navigate("Register");
  }}
>
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
  safe:{ 
    flex: 1, 
    backgroundColor: '#0B1120' 
  },
  container:{ flexGrow: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 24 
  },
  logoArea:{ 
    alignItems: 'center', 
    marginBottom: 32 
  },
  logoCircle:{
    width:70,
    height:70,
    borderRadius:20,
    backgroundColor:"#21D07A",
    justifyContent:"center",
    alignItems:"center",
    marginBottom:20
  },
  logoImage:{
    width: 80,
    height: 80,
  },
  appName:{ 
    fontSize: 34, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  appSub:{
    color:"#8F9BB3",
    fontSize:17,
    marginTop:10,
    marginBottom:35
  },
  card: {
    backgroundColor: 'transparent', 
    borderRadius: 20, 
    padding: 24, 
    width: '100%',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    elevation: 3,
  },
  title:{ fontSize: 22, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 20 
  },
  label:{
    color:"#AAB5D1",
    marginBottom:8,
    fontWeight:"600"
  },
  input:{
    backgroundColor:"#17213A",
    color:"#fff",
    borderRadius:14,
    padding:18,
    fontSize:16,
    marginBottom:18,
    borderWidth:1,
    borderColor:"#23304F"
  },
  eyeBtn:{ 
    position: 'absolute', 
    right: 14, 
    top: 14 
  },
  btn:{
    backgroundColor:"#21D07A",
    borderRadius:14,
    padding:18,
    alignItems:"center",
    marginTop:10
  },
  btnText:{ 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 18
  },
  row:{ 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 18 
  },
  grayText:{ 
    color: '#888', 
    fontSize: 14 
  },
  linkText:{
    color:"#21D07A",
    fontWeight:"bold"
  },
  googleBtn:{
    marginTop:15,
    backgroundColor:"#17213A",
    height:58,
    borderRadius:14,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center"
  },

  googleText:{
    color:"#fff",
    marginLeft:10,
    fontSize:16
  },
});