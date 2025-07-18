import { Assets } from "@/assets/Assets";
import CustomButton from "@/components/CustomButton";
import Header from "@/components/Header";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ConfirmForgotPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigation = useNavigation<any>();

  const handleConfirm = () => {
    if (password !== confirm) {
      alert("Password doesn't match");
      return;
    }
    console.log("✅ New password set:", password);
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={{ backgroundColor: theme.white, flex: 1 }}>
      <Header
        backgroundColor={theme.white}
        color={theme.white}
        colorIcon={theme.black}
        hideGoback={false}
        barStyle="dark-content"
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Image
            source={Assets.logoIStock}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>New Password</Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="gray" />
            <TextInput
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              placeholderTextColor={theme.border}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="gray" />
            <TextInput
              placeholder="Confirm Password"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              style={styles.input}
              placeholderTextColor={theme.border}
            />
          </View>

          <CustomButton label="Confirm" onPress={handleConfirm} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...theme.setFont,
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: theme.white,
  },
  logo: { width: 300, height: 200, alignSelf: "center", marginBottom: 16 },
  title: {
    ...theme.setFont,
    color: theme.mainApp,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  input: { ...theme.setFont, flex: 1, marginLeft: 8 },
});
