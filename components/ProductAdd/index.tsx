import CustomButton from "@/components/CustomButton";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import uuid from "react-native-uuid";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  productCode: string;
  modelOptions: { key: string; value: string }[];
  stockQty: number;
  value: any;
};

const ProductAddModalComponent = ({
  isVisible,
  onClose,
  onSave,
  productCode,
  modelOptions,
  stockQty,
  value,
}: Props) => {
  const [selectedModel, setSelectedModel] = useState("");
  const [orderQty, setOrderQty] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [remark, setRemark] = useState("");

  useEffect(() => {
    const isEmptyObject = Object.keys(value).length === 0;
    if (!isEmptyObject) {
      setOrderQty(value.orderQty);
      setSelectedModel(value.selectedModel);
      setSerialNo(value.serialNo);
      setRemark(value.remark);
    }
  }, [value]);

  const handleSave = () => {
    const isEmptyObject = Object.keys(value).length === 0;
    if (isEmptyObject) {
      onSave({
        productCode,
        selectedModel,
        orderQty,
        serialNo,
        remark,
        uuid: uuid.v4(),
      });
    } else {
      onSave({
        productCode,
        selectedModel,
        orderQty,
        serialNo,
        remark,
        uuid: value?.uuid,
      });
    }

    _onClose();
  };

  const _onClose = () => {
    resetState();
    onClose();
  };

  const resetState = () => {
    setSelectedModel("");
    setOrderQty("");
    setSerialNo("");
    setRemark("");
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeIcon} onPress={_onClose}>
            <Ionicons name="close" size={24} color={theme.gray} />
          </TouchableOpacity>

          <Text style={styles.title}>เพิ่มสินค้า</Text>

          <View style={styles.row}>
            <Text style={styles.label}>รหัสสินค้า</Text>
            <Text style={styles.textLink}>{productCode}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>รหัสแบบ</Text>
            <View style={{ flex: 1 }}>
              <SelectList
                setSelected={setSelectedModel}
                data={modelOptions}
                boxStyles={styles.selectBox}
                dropdownStyles={{ borderColor: theme.gray }}
                search={false}
                save="key"
                placeholder="เลือก"
              />
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>จำนวนคงเหลือ</Text>
            <Text style={[styles.stockQty, { color: theme.error }]}>
              {stockQty}
            </Text>
          </View>

          <Text style={styles.textLink}>จำนวนสินค้า</Text>
          <TextInput
            style={styles.input}
            value={orderQty}
            onChangeText={setOrderQty}
            keyboardType="numeric"
          />

          <Text style={styles.textLink}>Serial No</Text>
          <TextInput
            style={styles.input}
            value={serialNo}
            onChangeText={setSerialNo}
          />

          <Text style={styles.textLink}>หมายเหตุ</Text>
          <TextInput
            style={styles.input}
            value={remark}
            onChangeText={setRemark}
          />

          <View style={styles.imageBox}>
            <Ionicons name="image-outline" size={90} color={theme.gray} />
          </View>

          <CustomButton
            label="บันทึก"
            onPress={handleSave}
            disabled={
              selectedModel === "" || orderQty === "" || serialNo === ""
            }
          />
        </View>
      </View>
    </Modal>
  );
};

export default ProductAddModalComponent;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: theme.white,
    width: "90%",
    borderRadius: 16,
    padding: 16,
  },
  closeIcon: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 1,
  },
  title: {
    ...theme.setFont,
    color: theme.mainApp,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    ...theme.setFont,
    width: 100,
  },
  textLink: {
    ...theme.setFont,
    color: theme.mainApp,
  },
  stockQty: {
    ...theme.setFont,
    marginLeft: 8,
  },
  selectBox: {
    borderWidth: 0,
    backgroundColor: theme.background,
  },
  input: {
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    ...theme.setFont,
  },
  imageBox: {
    padding: 16,
    alignItems: "center",
    marginBottom: 8,
  },
});
