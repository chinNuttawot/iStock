import { Assets } from "@/assets/Assets";
import CustomButton from "@/components/CustomButton";
import Header from "@/components/Header";
import { theme } from "@/providers/Theme";
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    department: "",
    branch: "",
    password: "",
    email: "",
    lineId: "",
    phone: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = () => {
    console.log("✅ Registered:", form);
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <>
      <Header barStyle="dark-content" color={theme.white} />
      <ScrollView contentContainerStyle={styles.container}>
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
        <FormInput
          icon="office-building-outline"
          placeholder="Department"
          value={form.department}
          onChange={(v) => handleChange("department", v)}
          lib="MaterialCommunityIcons"
        />
        <FormInput
          icon="location"
          placeholder="Branch"
          value={form.branch}
          onChange={(v) => handleChange("branch", v)}
          lib="Entypo"
        />
        <FormInput
          icon="lock-closed-outline"
          placeholder="Password"
          value={form.password}
          onChange={(v) => handleChange("password", v)}
        />

        <Text style={styles.optionText}>Option</Text>

        <FormInput
          icon="mail-outline"
          placeholder="Email"
          value={form.email}
          onChange={(v) => handleChange("email", v)}
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
          />
        </View>
        <FormInput
          icon="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(v) => handleChange("phone", v)}
          lib="Feather"
        />
        <View style={{ marginTop: 24 }}>
          <CustomButton label={"Register"} onPress={handleRegister} />
        </View>
      </ScrollView>
    </>
  );
}

function FormInput({
  icon,
  placeholder,
  value,
  onChange,
  isPassword = false,
  lib = "Ionicons",
}: {
  icon: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  isPassword?: boolean;
  lib?: "Ionicons" | "MaterialCommunityIcons" | "Entypo" | "Feather";
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...theme.setFont,
    flexGrow: 1,
    // padding: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: theme.white,
  },
  logo: { width: 300, height: 250, alignSelf: "center", marginTop: -20 },
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
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  button: {
    ...theme.setFont,
    backgroundColor: theme.mainApp,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    ...theme.setFont,
    color: theme.white,
    textAlign: "center",
    fontSize: 16,
  },
});
