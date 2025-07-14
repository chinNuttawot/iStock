import React from "react";
import { Text } from "react-native";
import { theme } from "./providers/Theme";

export function AppWrapper({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const TextComponent = Text as any; // ✅ Bypass TypeScript
    if (!TextComponent.defaultProps) TextComponent.defaultProps = {};
    TextComponent.defaultProps.style = {
      ...theme.setFont,
    };
  }, []);

  return <>{children}</>;
}
