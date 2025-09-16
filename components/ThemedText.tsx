import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { theme } from "@/providers/Theme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    ...theme.setFont,
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    ...theme.setFont,
    fontSize: 32,
    lineHeight: 32,
  },
  subtitle: {
    ...theme.setFont,
    fontSize: 20,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: theme.secondary,
  },
});
