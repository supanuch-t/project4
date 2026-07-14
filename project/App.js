import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import { AuthProvider, useAuth } from "./app/context/AuthContext";
import LoginScreen from "./app/LoginScreen";
import RegisterScreen from "./app/RegisterScreen";
import BottomTabs from "./app/BottomTabs";
import AddExpenseScreen from "./app/AddExpenseScreen";

const Stack = createNativeStackNavigator();

function RootNavigator() {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B1120" }}>
                <ActivityIndicator size="large" color="#21D07A" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={currentUser ? "Home" : "Login"}
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Home" component={BottomTabs} />
                <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <RootNavigator />
        </AuthProvider>
    );
}
