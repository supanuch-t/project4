import React from "react";
import { View, StyleSheet, useWindowDimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResponsiveWrapper({ children }) {
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    return (
        <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
            <View style={s.background}>
                <View style={[s.container, isDesktop && s.desktopContainer]}>
                    {children}
                </View>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#060A13" },
    background: {
        flex: 1,
        backgroundColor: "#060A13",
        alignItems: "center",
    },
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#0B1120",
    },
    desktopContainer: {
        maxWidth: 800,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: "#23304F",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    }
});
