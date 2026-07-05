import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./app/LoginScreen";
import RegisterScreen from "./app/RegisterScreen";
import BottomTabs from "./app/BottomTabs";
import AddExpenseScreen from "./app/AddExpenseScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />
        <Stack.Screen
          name="Home"
          component={BottomTabs}
        />
        <Stack.Screen
          name="AddExpense"
          component={AddExpenseScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
