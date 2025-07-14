
import { theme } from "@/providers/Theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    headerImage: {
        color: theme.gray,
        bottom: -90,
        left: -35,
        position: "absolute",
    },
    titleContainer: {
        flexDirection: "row",
        gap: 8,
    },
});
