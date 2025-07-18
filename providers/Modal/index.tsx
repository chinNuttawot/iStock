import CustomButtons from "@/components/CustomButtons";
import React from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { theme } from "../Theme";
import { ModalComponentModel } from "./Model";

function ModalComponent(props: ModalComponentModel) {
  const {
    isOpen = false,
    onChange,
    children,
    onChangeCancel,
    hideCustomButtons = false,
    backgroundColor,
  } = props;

  const toggleModal = () => {
    onChange && onChange(!isOpen);
  };

  return (
    <Modal isVisible={isOpen} onBackdropPress={() => toggleModal()}>
      <View
        style={{
          backgroundColor: props.backgroundColor || theme.white,
          borderRadius: 8,
          padding: 16,
          alignItems: "center",
        }}
      >
        {children && children}
        <View style={{ flexDirection: "row" }}>
          {onChangeCancel && (
            <CustomButtons
              onPress={onChangeCancel}
              {...props.option?.changeCancel}
            />
          )}
          {!hideCustomButtons && (
            <CustomButtons onPress={toggleModal} {...props.option?.change} />
          )}
        </View>
      </View>
    </Modal>
  );
}

export default ModalComponent;
