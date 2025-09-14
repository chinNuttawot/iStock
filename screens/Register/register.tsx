import { Assets } from "@/assets/Assets";
import CustomButton from "@/components/CustomButton";
import Header from "@/components/Header";
import { theme } from "@/providers/Theme";
import {
  binCodesByLocationService,
  locationService,
  RegisterService,
} from "@/service";
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export const keyboardTypeNumber = "numeric";
type Option = { key: string; value: string };

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [DEPARTMENTS, setDEPARTMENTS] = useState<any[]>([]);
  const [isload, setIsload] = useState<boolean>(false);
  const [BRANCHES, setBRANCHES] = useState<any[]>([]);
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    department: "",
    branch: "",
    password: "",
    email: "",
    lineId: "",
    phoneNumber: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    try {
      setIsload(true);
      let _form = form;
      _form = {
        ..._form,
        password: Buffer.from(_form.password, "utf8").toString("base64"),
      };
      await RegisterService(_form);
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (err) {
      Alert.alert("เกิดข้อผิดพลาด", "ลองใหม่อีกครั้ง");
    } finally {
      setIsload(false);
    }
  };

  const departmentLabel = useMemo(
    () => DEPARTMENTS.find((d) => d.value === form.department)?.key ?? "",
    [form.department]
  );
  const branchLabel = useMemo(
    () => BRANCHES.find((b) => b.value === form.branch)?.key ?? "",
    [form.branch]
  );

  useEffect(() => {
    getLocations();
  }, []);

  useEffect(() => {
    if (form.department) {
      setForm((prev) => ({ ...prev, ["branch"]: "" }));
      getBinCodesByLocation(form.department);
    }
  }, [form.department]);

  const getLocations = async () => {
    try {
      const { data } = await locationService();
      setDEPARTMENTS(data);
    } catch (err) {}
  };

  const getBinCodesByLocation = async (locationCodeFrom: string) => {
    try {
      const { data } = await binCodesByLocationService({ locationCodeFrom });
      setBRANCHES(data);
    } catch (err) {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.white }}>
      <Header
        backgroundColor={theme.white}
        color={theme.white}
        colorIcon={theme.black}
        hideGoback={false}
        barStyle="dark-content"
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <Image
              source={Assets.logoIStock}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Register</Text>

            <FormInput
              icon="person-outline"
              placeholder="username"
              value={form.username}
              onChange={(v) => handleChange("username", v)}
            />
            <FormInput
              icon="person-outline"
              placeholder="First Name"
              value={form.firstName}
              onChange={(v) => handleChange("firstName", v)}
            />
            <FormInput
              icon="person-outline"
              placeholder="Last Name"
              value={form.lastName}
              onChange={(v) => handleChange("lastName", v)}
            />

            {/* ✅ Department: Dropdown */}
            <SelectInput
              icon="office-building-outline"
              lib="MaterialCommunityIcons"
              placeholder="Department"
              value={form.department}
              displayLabel={departmentLabel}
              options={DEPARTMENTS}
              onChangeValue={(val) => handleChange("department", val)}
            />

            {/* ✅ Branch: Dropdown */}
            <SelectInput
              icon="location"
              lib="Entypo"
              placeholder="Branch"
              value={form.branch}
              displayLabel={branchLabel}
              options={BRANCHES}
              onChangeValue={(val) => handleChange("branch", val)}
            />

            <FormInput
              icon="lock-closed-outline"
              placeholder="Password"
              value={form.password}
              onChange={(v) => handleChange("password", v)}
              isPassword
            />

            <Text style={styles.optionText}>Option</Text>

            <FormInput
              icon="mail-outline"
              placeholder="Email"
              value={form.email}
              onChange={(v) => handleChange("email", v)}
              keyboardType="email-address"
            />

            <View style={styles.inputWrapper}>
              <Image
                source={Assets.lineIcon}
                style={styles.lineIcon}
                resizeMode="contain"
              />
              <TextInput
                style={styles.input}
                placeholder="ID Line"
                value={form.lineId}
                onChangeText={(v) => handleChange("lineId", v)}
                placeholderTextColor={theme.border}
                autoCapitalize="none"
              />
            </View>

            <FormInput
              icon="phone"
              placeholder="Phone Number"
              value={form.phoneNumber}
              onChange={(v) => handleChange("phoneNumber", v)}
              lib="Feather"
              keyboardType={keyboardTypeNumber}
            />

            <View style={{ marginTop: 24 }}>
              <CustomButton
                label={"Register"}
                onPress={handleRegister}
                isload={isload}
                disabled={isload}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

/** ================== Reusable Text Input ================== */
function FormInput({
  icon,
  placeholder,
  value,
  onChange,
  isPassword = false,
  lib = "Ionicons",
  keyboardType,
}: {
  icon: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  isPassword?: boolean;
  lib?: "Ionicons" | "MaterialCommunityIcons" | "Entypo" | "Feather";
  keyboardType?: KeyboardTypeOptions;
}) {
  const IconComponent =
    lib === "MaterialCommunityIcons"
      ? MaterialCommunityIcons
      : lib === "Entypo"
      ? Entypo
      : lib === "Feather"
      ? Feather
      : Ionicons;

  return (
    <View style={styles.inputWrapper}>
      <IconComponent name={icon as any} size={20} color="gray" />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        secureTextEntry={isPassword}
        onChangeText={onChange}
        placeholderTextColor={theme.border}
        keyboardType={keyboardType || "default"}
        autoCapitalize="none"
      />
    </View>
  );
}

/** ================== Reusable Select (Dropdown) ================== */
function SelectInput({
  icon,
  lib = "Ionicons",
  placeholder,
  value,
  displayLabel,
  options,
  onChangeValue,
}: {
  icon: string;
  lib?: "Ionicons" | "MaterialCommunityIcons" | "Entypo" | "Feather";
  placeholder: string;
  value: string;
  displayLabel: string; // key ที่โชว์ (คำนวณจาก value ภายนอก)
  options: Option[];
  onChangeValue: (v: string) => void;
}) {
  const IconComponent =
    lib === "MaterialCommunityIcons"
      ? MaterialCommunityIcons
      : lib === "Entypo"
      ? Entypo
      : lib === "Feather"
      ? Feather
      : Ionicons;

  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setOpen(true)}
        style={[styles.inputWrapper, { justifyContent: "space-between" }]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <IconComponent name={icon as any} size={20} color="gray" />
          <Text
            style={[
              styles.input,
              { color: value ? theme.black : theme.border, marginLeft: 8 },
            ]}
            numberOfLines={1}
          >
            {value ? displayLabel : placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={theme.border} />
      </TouchableOpacity>

      {/* Modal Dropdown */}
      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={modalStyles.backdrop}
          onPress={() => setOpen(false)}
        />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.sheetHeader}>
            <Text style={modalStyles.sheetTitle}>{placeholder}</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Ionicons name="close" size={20} color={theme.black} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            ItemSeparatorComponent={() => <View style={modalStyles.sep} />}
            renderItem={({ item }) => {
              const selected = item.value === value;
              return (
                <TouchableOpacity
                  style={modalStyles.row}
                  onPress={() => {
                    onChangeValue(item.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      modalStyles.rowText,
                      { color: selected ? theme.mainApp : theme.black },
                    ]}
                  >
                    {item.key}
                  </Text>
                  {selected ? (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={theme.mainApp}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    ...theme.setFont,
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: theme.white,
  },
  logo: { width: 300, height: 200, alignSelf: "center", marginTop: -20 },
  title: {
    ...theme.setFont,
    fontSize: 18,
    color: theme.mainApp,
    textAlign: "center",
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  input: {
    ...theme.setFont,
    flex: 1,
    marginLeft: 8,
  },
  lineIcon: {
    width: 20,
    height: 20,
  },
  optionText: {
    ...theme.setFont,
    color: theme.mainApp,
    textAlign: "center",
    marginVertical: 8,
  },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  sheet: {
    position: "absolute",
    left: 16,
    right: 16,
    top: "20%",
    maxHeight: "60%",
    backgroundColor: theme.white,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E6E6E6",
  },
  sheetTitle: {
    ...theme.setFont,
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowText: {
    ...theme.setFont,
    fontSize: 15,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#EFEFEF",
  },
});
