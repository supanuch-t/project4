import React, { useEffect, useState } from "react";
import axios from "axios";
import {View, Text, FlatList, StyleSheet, SafeAreaView} from "react-native";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState(15000);
    const navigation = useNavigation();

    useEffect(() => {
        loadExpenses();
    }, []);
    const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount),0);
    const balance = income - totalExpense;

    const loadExpenses = async () => {
        try {
            const res = await axios.get("http://10.0.2.2:3000/api/expenses");
            setExpenses(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.hello}>สวัสดี 👋</Text>
                    <Text style={styles.username}>Supanuch</Text>
                </View>

                <View style={styles.avatar}>
                    <Text style={{color:"#fff",fontSize:20}}>👤</Text>
                </View>
            </View>
       <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>ยอดเงินคงเหลือ</Text>
            <Text style={styles.balanceMoney}>฿ {balance.toLocaleString()}</Text>
       </View>

    <View style={styles.row}>

        <View style={styles.smallCard}>
            <Text style={styles.cardTitle}>💰 รายรับ</Text>
            <Text style={styles.income}>฿ {income.toLocaleString()}</Text>
        </View>

        <View style={styles.smallCard}>
            <Text style={styles.cardTitle}>💸 รายจ่าย</Text>
            <Text style={styles.expense}>฿ {totalExpense.toLocaleString()}</Text>
        </View>

    </View>

      <Text style={styles.subtitle}>รายการล่าสุด</Text>

            <FlatList
                data={expenses}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                      <View style={styles.itemLeft}>
                            <Text style={styles.icon}>🛒</Text>

                            <View>
                                <Text style={styles.name}>{item.title}</Text>
                                <Text style={styles.category}>{item.category}</Text>
                            </View>
                        </View>
                        <Text style={styles.money}>-฿ {item.amount}</Text>

                    </View>   
                    
                )}/>
                <TouchableOpacity style={styles.addButton}onPress={() => navigation.navigate("AddExpense")}>
                    <Text style={styles.addButtonText}>＋</Text>
                </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({

    container:{
        flex:1,
        padding:20,
        backgroundColor:"#111827"
    },

    header:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        marginBottom:20
    },

    username:{
        color:"#D1D5DB",
        fontSize:16,
        marginTop:4
    },

    avatar:{
        width:50,
        height:50,
        borderRadius:25,
        backgroundColor:"#22C55E",
        justifyContent:"center",
        alignItems:"center"
    },

    title:{
        fontSize:26,
        fontWeight:"bold",
        marginBottom:20
    },

    card:{
        backgroundColor:"#1F2937",
        padding:18,
        marginBottom:12,
        borderRadius:15,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center"
    },

    name:{
        color:"#fff",
        fontSize:17,
        fontWeight:"600"
    },

    money:{
        color:"#EF4444",
        fontSize:18,
        fontWeight:"bold"
    },
    hello:{
        fontSize:28,
        fontWeight:"bold",
        color:"#FFFFFF",
        marginBottom:15
    },
    balanceCard:{
        backgroundColor:"#22C55E",
        padding:25,
        borderRadius:20,
        marginBottom:20,
        elevation:5
    },
    balanceTitle:{
        color:"#E5E7EB",
        fontSize:15
    },
    balanceMoney:{
        color:"#fff",
        fontSize:36,
        fontWeight:"bold",
        marginTop:10
    },
    row:{
        flexDirection:"row",
        justifyContent:"space-between",
        gap: 10,
        marginBottom:20
    },
    smallCard:{
        backgroundColor:"#fff",
        width:"48%",
        padding:18,
        borderRadius:18
    },
    income:{
        color:"#22C55E",
        fontSize:24,
        fontWeight:"bold"
    },
    expense:{
        color:"#EF4444",
        fontSize:24,
        fontWeight:"bold"
    },
    subtitle:{
        fontSize:20,
        fontWeight:"bold",
        marginBottom:12,
        color:"#FFFFFF"
    },

    cardTitle:{
        color:"#6B7280",
        fontSize:15,
        marginBottom:8
    },

    category:{
        color:"#9CA3AF"
    },
    itemLeft:{
        flexDirection:"row",
        alignItems:"center"
    },

    icon:{
        fontSize:28,
        marginRight:15
    },

    addButton:{
        position:"absolute",
        right:25,
        bottom:30,
        width:65,
        height:65,
        borderRadius:35,
        backgroundColor:"#22C55E",
        justifyContent:"center",
        alignItems:"center",
        elevation:10
    },

    addButtonText:{
        color:"#fff",
        fontSize:38,
        marginTop:-2
    }
});

export default HomeScreen;