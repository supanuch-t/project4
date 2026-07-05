import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./HomeScreen";
import ReportScreen from "./ReportScreen";
import AddExpenseScreen from "./AddExpenseScreen";
import BudgetScreen from "./BudgetScreen";
import ProfileScreen from "./ProfileScreen";

const Tab = createBottomTabNavigator();

function BottomTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "#111827",
                    height: 60
                },
                tabBarActiveTintColor: "#22C55E",
                tabBarInactiveTintColor: "#999"
            }}
        >
            <Tab.Screen
                name="หน้าหลัก"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            name="home-outline"
                            size={24}
                            color={color}
                        />
                    )
                }}
            />

            <Tab.Screen
                name="ประวัติ"
                component={ReportScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            name="list-outline"
                            size={24}
                            color={color}
                        />
                    )
                }}
            />

            <Tab.Screen
                name="เพิ่ม"
                component={AddExpenseScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            name="add-circle"
                            size={30}
                            color={color}
                        />
                    )
                }}
            />

            <Tab.Screen
                name="งบประมาณ"
                component={BudgetScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            name="stats-chart-outline"
                            size={24}
                            color={color}
                        />
                    )
                }}
            />

            <Tab.Screen
                name="โปรไฟล์"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            name="person-outline"
                            size={24}
                            color={color}
                        />
                    )
                }}
            />

        </Tab.Navigator>
    );
}

export default BottomTabs;