import { theme } from "@/providers/Theme";
import React from "react";
import { Text, View } from "react-native";

function DeleteAccount(props: any) {
  return (
    <View>
      <Text
        style={{
          ...theme.setFont_Bold,
          textAlign: "center",
          padding: 16,
          fontSize: 18,
          textAlignVertical: "center",
        }}
      >
        {`คุณต้องการลบบัญชีของคุณหรือไม่?`}
      </Text>
      <Text
        style={{
          ...theme.setFont,
          textAlign: "center",
          padding: 16,
          marginBottom: 16,
          textAlignVertical: "center",
        }}
      >
        {`การลบบัญชีจะทำให้ข้อมูลทั้งหมดของคุณถูกลบอย่างถาวร และไม่สามารถกู้คืนได้`}
      </Text>
    </View>
  );
}

export default DeleteAccount;
