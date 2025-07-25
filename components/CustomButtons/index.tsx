import { theme } from "@/providers/Theme";
import { Text, TouchableOpacity } from "react-native";

export default function CustomButtons(props: any) {
  return (
    <TouchableOpacity
      disabled={props.disabled}
      onPress={props.onPress}
      style={{
        ...theme.setFont,
        alignItems: "center",
        height: 52,
        marginLeft: 8,
        marginRight: 8,
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: props.disabled
          ? theme.border
          : props.color || theme.mainApp,
        borderRadius: 8,
      }}
    >
      <Text style={{ ...theme.setFont, color: props.colorText || theme.white }}>
        {props.label}
      </Text>
    </TouchableOpacity>
  );
}
