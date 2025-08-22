import React from "react";
import {
    ActivityIndicator,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

type Props = {
  message?: string;
  color?: string;
  textColor?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
};

export default function LoadingView({
  message = "กำลังโหลดข้อมูล…",
  color = "#0ea5e9",
  textColor = "#9ca3af",
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
      <ActivityIndicator size="large" color={color} />
      <Text style={[{ marginTop: 8, color: textColor }, textStyle]}>
        {message}
      </Text>
    </View>
  );
}
