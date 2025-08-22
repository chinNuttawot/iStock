// components/modals/ConfirmModal.tsx
import ModalComponent from "@/providers/Modal";
import { styles } from "@/screens/Approve/Styles";
import { optionModalComponent } from "@/screens/Setting/SettingScreen";
import React from "react";
import { Text, View } from "react-native";

type Props = {
  isOpen: boolean;
  message: string | React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  isOpen,
  message,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <ModalComponent
      isOpen={isOpen}
      onChange={() => onConfirm()}
      option={optionModalComponent}
      onBackdropPress={() => onCancel()}
      onChangeCancel={onCancel}
    >
      <View style={styles.mainView}>
        {typeof message === "string" ? (
          <Text style={styles.label}>{message}</Text>
        ) : (
          message
        )}
      </View>
    </ModalComponent>
  );
}
