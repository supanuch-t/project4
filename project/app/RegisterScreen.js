import React, { useState } from "react";

import { View, Text, TextInput, TouchableOpacity, Alert, Image, StyleSheet, } from "react-native";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from "@expo/vector-icons";


const RegisterScreen = ({ navigation }) => {
        const [forms, setForms] = useState({
            name: "",
            email: "",
            username: "",
            password: "",
            confirmPassword: "",
            image: null
        });

        const pickImage = async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });
            if (!result.canceled) setForms({ ...forms, image: result.assets[0].uri })
        }
        const handleRegister = async  () => {
            if (!forms.name || !forms.email || !forms.username || !forms.password ) {
                return Alert.alert("Error", "กรอกข้อมูลสำคัญให้ครบ")    
            }
            if (forms.password !== forms.confirmPassword) {
                return Alert.alert("Error", "รหัสผ่านต้องตรงกัน")
            }
            
            try {
              const res = await axios.post("http://10.0.2.2:3000/api/register", {
                  username: forms.username,
                  email: forms.email,
                  password: forms.password
              });
              if (res.data.success) {

            
            Alert.alert("สำเร็จ", "สมัครสมาชิกเรียบร้อย", [
                { text: 'ตกลง', onPress: () => navigation.navigate('Login')}
            ]);
          } else {
              Alert.alert("Error", res.data.message );
          }
        } catch (error) {
          Alert.alert("Error", "เกิดข้อผิดพลาดในการสมัครสมาชิก");
      }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>สมัครสมาชิก</Text>
            <View style={styles.imageSection}>
                <TouchableOpacity onPress={pickImage} style={styles.imageBtn}>
                    {forms.image ? (
                        <Image source={{ uri: forms.image }} style={styles.avatar} />
                    ) : (
                        <Ionicons name="person-add" size={45} color="#4CAF50"  />
                    )}
                </TouchableOpacity>
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="ชื่อ-นามสกุล"
                        value={forms.name}
                        onChangeText={(t) => setForms({ ...forms, name: t })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        onChangeText={(t) => setForms({ ...forms, email: t })}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        onChangeText={(t) => setForms({ ...forms, username: t })} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry
                        onChangeText={(t) => setForms({ ...forms, password: t })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        secureTextEntry
                        onChangeText={(t) => setForms({ ...forms, confirmPassword: t })}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleRegister}>
                        <Text style={styles.buttonText}>REGISTER</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
        </View>
    )
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#e8f5e9"},
    header: {
        padding: 15,
        paddingTop: 30,
        fontSize: 20,
        fontWeight: "bold",
        color: "#2E7D32",
        alignSelf: "center"
    },
    imageSection: { alignItems: "center", marginVertical: 10},
    imageBtn: { width: 100, height: 100, borderRadius: 50},
    avatar: { width: 100, height: 100, borderRadius: 50},
    form: { padding: 25},
    input: {
        height: 50,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: "#f1f8e9",
        borderColor: "#4CAF50",
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    btn: {
        backgroundColor: "#4A90E2",
        height: 50,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10
    },
    btnText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold"
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 15,
        alignItems: 'center',
        borderRadius: 15,
        marginTop: 25
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },

})

export default RegisterScreen;