import CustomButtons from "@/components/CustomButtons";
import React from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { theme } from "../Theme";
import { ModalComponentModel } from "./Model";

function ModalComponent(props: ModalComponentModel) {
  const { isOpen = false, onChange, children, onChangeCancel } = props;

  const toggleModal = () => {
    onChange && onChange(!isOpen);
  };

  return (
    <Modal isVisible={isOpen}>
      <View
        style={{ backgroundColor: theme.white, borderRadius: 8, padding: 16 }}
      >
        {children && children}
        <View style={{ flexDirection: "row" }}>
          {onChangeCancel && (
            <CustomButtons
              onPress={onChangeCancel}
              {...props.option?.changeCancel}
            />
          )}
          <CustomButtons onPress={toggleModal} {...props.option?.change} />
        </View>
      </View>
    </Modal>
  );
}

export default ModalComponent;
