import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

type Props = {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  color?: string; // icon/text color
  accentColor?: string; // retry color
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
};

export default function ErrorState({
  message = "เกิดข้อผิดพลาดในการดึงข้อมูล",
  onRetry,
  retryLabel = "ลองใหม่",
  color = "#ef4444",
  accentColor = "#0ea5e9",
  containerStyle,
  textStyle,
}: Props) {
  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        },
        containerStyle,
      ]}
    >
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={72}
        color={color}
        style={{ marginBottom: 12 }}
      />
      <Text
        style={[{ color, textAlign: "center", marginBottom: 12 }, textStyle]}
      >
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry}>
          <Text style={{ color: accentColor, fontWeight: "600" }}>
            {retryLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
