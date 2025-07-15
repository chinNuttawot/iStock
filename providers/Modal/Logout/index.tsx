import { theme } from "@/providers/Theme";
import React from "react";
import { Text } from "react-native";

function ModalLogout(props: any) {
  return (
    <Text
      style={{
        ...theme.setFont,
        textAlign: "center",
        padding: 16,
        height: 120,
        textAlignVertical: "center",
      }}
    >
      คุณต้องการออกจากระบบหรือไม่?
    </Text>
  );
}

export default ModalLogout;
