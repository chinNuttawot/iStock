import CustomButton from "@/components/CustomButton";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
  description: string;
};

const ProductAddModalComponent = ({
  isVisible,
  onClose,
  onSave,
  productCode,
  modelOptions,
  stockQty,
  value,
  description,
}: Props) => {
  const [model, setModel] = useState("");
  const [quantity, setQuantity] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [remark, setRemark] = useState("");
  const [picURL, setPicURL] = useState("");

  useEffect(() => {
    const isEmptyObject = Object.keys(value).length === 0;
    if (!isEmptyObject) {
      setQuantity(value.quantity);
      setModel(value.model);
      setSerialNo(value.serialNo);
      setRemark(value.remark);
    }
  }, [value]);

  const handleSave = () => {
    const isEmptyObject = Object.keys(value).length === 0;
    if (isEmptyObject) {
      onSave({
        productCode,
        model,
        quantity,
        serialNo,
        remark,
        uuid: uuid.v4(),
        picURL,
      });
    } else {
      onSave({
        productCode,
        model,
        quantity,
        serialNo,
        remark,
        uuid: value?.uuid,
        picURL,
      });
    }

    _onClose();
  };

  const _onClose = () => {
    resetState();
    onClose();
  };

  const resetState = () => {
    setModel("");
    setQuantity("");
    setSerialNo("");
    setRemark("");
    setPicURL("");
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
                setSelected={(res: any) => {
                  setModel(res);
                  const _picURL =
                    modelOptions.filter((v) => v.value === res)[0]?.picURL ??
                    "";

                  setPicURL(_picURL);
                }}
                data={modelOptions}
                boxStyles={styles.selectBox}
                dropdownStyles={{ borderColor: theme.gray }}
                search={true}
                save="key"
                placeholder="เลือก"
                defaultOption={{
                  key: modelOptions[0]?.key ?? "",
                  value: modelOptions[0]?.value ?? "",
                }}
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
            value={quantity.toString()}
            onChangeText={(num) => {
              if (num === "") {
                setQuantity("");
                return;
              }

              const parsed = Number(num);
              if (!isNaN(parsed) && parsed <= stockQty) {
                setQuantity(parsed.toString());
              }
            }}
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
            style={[styles.input, { height: 150 }]}
            value={remark}
            onChangeText={setRemark}
            multiline={true}
          />
          <Text style={styles.textError}>{description}</Text>

          {picURL && (
            <View style={styles.imageBox}>
              <Image
                source={{ uri: picURL }}
                style={styles.imageItem}
                resizeMode="cover"
              />
            </View>
          )}

          <CustomButton
            label="บันทึก"
            onPress={handleSave}
            disabled={model === "" || quantity === ""}
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
  textError: {
    ...theme.setFont,
    color: theme.error,
    textAlign: "center",
  },
  imageItem: {
    width: 120,
    height: 100,
    alignSelf: "center",
    marginTop: 16,
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
    justifyContent: "flex-start",
  },
  imageBox: {
    alignItems: "center",
    marginBottom: 8,
  },
});
