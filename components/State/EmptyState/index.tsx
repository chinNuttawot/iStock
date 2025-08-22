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
  title?: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  actionLabel?: string;
  onAction?: () => void;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  buttonBg?: string;
  buttonTextColor?: string;
};

export default function EmptyState({
  title = "ไม่พบรายการ",
  subtitle = "ลองปรับตัวกรอง หรือแตะปุ่มด้านล่างเพื่อรีโหลดข้อมูล",
  icon = "file-search-outline",
  color = "#9ca3af",
  actionLabel = "รีโหลด",
  onAction,
  containerStyle,
  titleStyle,
  subtitleStyle,
  buttonBg = "#0ea5e9",
  buttonTextColor = "#ffffff",
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
        name={icon as any}
        size={72}
        color={color}
        style={{ marginBottom: 12 }}
      />
      <Text style={[{ color, fontSize: 16, marginBottom: 6 }, titleStyle]}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            { color, opacity: 0.85, textAlign: "center", marginBottom: 16 },
            subtitleStyle,
          ]}
        >
          {subtitle}
        </Text>
      ) : null}

      {onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: buttonBg,
          }}
        >
          <Text style={{ color: buttonTextColor, fontWeight: "600" }}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
