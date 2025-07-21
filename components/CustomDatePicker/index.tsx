import CustomButton from "@/components/CustomButton";
import ModalComponent from "@/providers/Modal";
import { theme } from "@/providers/Theme";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, View } from "react-native";

type Props = {
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel?: () => void;
  mode?: "date" | "time" | "datetime";
};

const CustomDatePicker = ({
  value,
  onConfirm,
  onCancel,
  mode = "date",
}: Props) => {
  const [selectedDate, setSelectedDate] = useState<Date>(value);
  const [show, setShow] = useState<boolean>(true);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
      if (date) onConfirm(date);
      else onCancel && onCancel();
    } else {
      if (date) setSelectedDate(date);
    }
  };

  const handleConfirmIOS = () => {
    onConfirm(selectedDate);
    setShow(false);
  };

  return (
    <>
      {Platform.OS === "ios" && show && (
        <ModalComponent
          onBackdropPress={onCancel}
          isOpen={show}
          hideCustomButtons
          onChange={onCancel}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              paddingTop: 16,
              alignSelf: "center",
            }}
          >
            <DateTimePicker
              value={selectedDate}
              mode={mode}
              display="inline"
              locale="th-TH"
              onChange={handleChange}
              themeVariant="light"
              style={{ alignSelf: "center" }}
            />

            <View
              style={{
                paddingHorizontal: 16,
                paddingBottom: 16,
                marginTop: 8,
              }}
            >
              <CustomButton
                label="ยืนยัน"
                onPress={handleConfirmIOS}
                style={{
                  backgroundColor: theme.mainApp,
                  borderRadius: 8,
                  height: 45,
                }}
                textStyle={{ color: "white", fontSize: 16 }}
              />
            </View>
          </View>
        </ModalComponent>
      )}

      {Platform.OS === "android" && show && (
        <DateTimePicker
          value={value}
          mode={mode}
          display="default"
          locale="th-TH"
          onChange={handleChange}
        />
      )}
    </>
  );
};

export default CustomDatePicker;
