import CustomButtons from "@/components/CustomButtons";
import React, { cloneElement, useMemo } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../Theme";
import { ModalComponentModel } from "./Model";

function ModalComponent(props: ModalComponentModel) {
  const {
    isOpen = false,
    onChange,
    children,
    onChangeCancel,
    hideCustomButtons = false,
    onBackdropPress,
  } = props;

  const toggleModal = () => {
    onChange && onChange(!isOpen);
  };

  const backdropPress = () => {
    onBackdropPress && onBackdropPress(false);
  };

  const changeButton = useMemo(() => {
    return <CustomButtons onPress={toggleModal} {...props.option?.change} />;
  }, [props.option?.change]);

  const clonedChild = useMemo(() => {
    return (
      children &&
      React.isValidElement(children) &&
      cloneElement(children, { changeButton })
    );
  }, [children, changeButton]);

  const IconCancel = () => {
    return (
      <View style={{ width: "100%", alignItems: "flex-end" }}>
        <TouchableOpacity
          onPressIn={() => {
            backdropPress();
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "bold" }}>X</Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View
        style={[
          {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 16,
          },
        ]}
      >
        <View
          style={{
            backgroundColor: props.backgroundColor || theme.white,
            borderRadius: 8,
            padding: 16,
            alignItems: "center",
          }}
        >
          {onBackdropPress && <IconCancel />}
          {clonedChild}
          <View style={{ flexDirection: "row" }}>
            {onChangeCancel && (
              <CustomButtons
                onPress={onChangeCancel}
                {...props.option?.changeCancel}
              />
            )}
            {!hideCustomButtons && changeButton}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default ModalComponent;
