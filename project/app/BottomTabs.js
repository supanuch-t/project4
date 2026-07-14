import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./HomeScreen";
import BudgetScreen from "./BudgetScreen";
import ReportScreen from "./ReportScreen";
import ProfileScreen from "./ProfileScreen";
import HistoryScreen from "./HistoryScreen";
import ResponsiveWrapper from "../components/ResponsiveWrapper";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
    return (
        <ResponsiveWrapper>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => {
                        let iconName;
                        if (route.name === "หน้าหลัก") iconName = "home";
                        else if (route.name === "ประวัติ") iconName = "list";
                        else if (route.name === "รายงาน") iconName = "pie-chart";
                        else if (route.name === "งบประมาณ") iconName = "wallet";
                        else if (route.name === "โปรไฟล์") iconName = "person";
                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: "#21D07A",
                    tabBarInactiveTintColor: "#8F9BB3",
                    tabBarStyle: {
                        backgroundColor: "#17213A",
                        borderTopColor: "#23304F",
                        paddingBottom: 5,
                        height: 60,
                    },
                })}
            >
                <Tab.Screen name="หน้าหลัก" component={HomeScreen} />
                <Tab.Screen name="ประวัติ" component={HistoryScreen} />
                <Tab.Screen name="รายงาน" component={ReportScreen} />
                <Tab.Screen name="งบประมาณ" component={BudgetScreen} />
                <Tab.Screen name="โปรไฟล์" component={ProfileScreen} />
            </Tab.Navigator>
        </ResponsiveWrapper>
    );
}