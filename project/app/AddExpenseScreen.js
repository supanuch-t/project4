import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const AddExpenseScreen = () => {
const [type, setType] = useState("expense");
    return (
        <View style={styles.container}>
            <Text style={styles.title}>บันทึกรายการ</Text>
            <Text style={styles.subTitle}>เพิ่มรายรับหรือรายจ่ายใหม่</Text>
            <View style={styles.typeContainer}>
                <TouchableOpacity
                    style={[styles.typeButton, type === "expense" && styles.activeButton]}
                    onPress={() => setType("expense")}>
                    <Text style={[styles.typeText, type === "expense" && styles.activeText]}>
                    💸 รายจ่าย
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.typeButton, type === "income" && styles.activeButton]}
                    onPress={() => setType("income")}>
                    <Text style={[styles.typeText, type === "income" && styles.activeText]}>
                    💰 รายรับ
                    </Text>
                </TouchableOpacity>

            </View>

        </View>
        
    );
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#0F172A",
        padding:20
    },

    title:{
        color:"#fff",
        fontSize:30,
        fontWeight:"bold",
        marginTop:20
    },

    subTitle:{
        color:"#94A3B8",
        marginTop:5,
        fontSize:16
    },
    typeContainer:{
        flexDirection:"row",
        marginTop:30,
        justifyContent:"space-between"
    },

    typeButton:{
        width:"48%",
        backgroundColor:"#1F2937",
        padding:18,
        borderRadius:15,
        alignItems:"center"
    },

    activeButton:{
        backgroundColor:"#22C55E"
    },

    typeText:{
        color:"#fff",
        fontSize:18,
        fontWeight:"600"
    },

    activeText:{
        color:"#fff"
    },
});

export default AddExpenseScreen;